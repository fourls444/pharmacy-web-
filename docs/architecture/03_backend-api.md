# 03_backend-api

`03_backend-api` คือ REST API กลางของระบบ ใช้ Fastify เป็น HTTP server, Drizzle ORM เป็น database layer, PostgreSQL เป็นฐานข้อมูล และ Supabase Storage สำหรับไฟล์/รูป

## Technology stack

| Area | Implementation |
| --- | --- |
| Runtime | Node.js |
| Server | Fastify 5 |
| Auth | `@fastify/jwt`, bcrypt password hash |
| Security | CORS, rate limit |
| Upload | `@fastify/multipart`, Supabase Storage helper |
| Database | PostgreSQL via `pg` |
| ORM | Drizzle ORM |
| Dev runner | `tsx watch src/server.ts` |

## Root files

| File | Purpose |
| --- | --- |
| `package.json` | scripts และ dependency ของ API |
| `drizzle.config.ts` | Drizzle Kit schema config |
| `tsconfig.json` | TypeScript config |
| `src/server.ts` | entry point ของ Fastify server |

## Server bootstrap

`src/server.ts` ทำงานตามลำดับ:

1. โหลด `.env` ผ่าน `dotenv/config`
2. สร้าง Fastify app พร้อม logger
3. ตั้ง `bodyLimit` และ `requestTimeout` สำหรับ upload ขนาดใหญ่
4. ตรวจ `JWT_SECRET`
5. register plugin:
   - JWT
   - rate limit
   - CORS
   - multipart upload
6. register routes ทั้งหมด
7. listen ที่ `PORT` หรือ default `8080`

## Environment variables

ค่าที่ระบบต้องการจาก env:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `PORT` | `server.ts` | port ของ API |
| `JWT_SECRET` | `server.ts`, JWT plugin | sign/verify token |
| `DATABASE_URL` | `db/index.ts`, `drizzle.config.ts` | PostgreSQL connection |
| `FRONTEND_URL` | CORS config | allow origin production |
| `PHARMACY_ASSERTION_PUBLIC_JWK` | `utils/pharmacyAssertion.ts` | public Ed25519 JWK สำหรับตรวจ Pharmacy session assertion ที่เว็บหน้าบ้านลงนาม |
| `PHARMACY_ASSERTION_KEY_ID` | `utils/pharmacyAssertion.ts` | key id ที่ต้องตรงกับ assertion signer |
| `PHARMACY_ASSERTION_ISSUER` | `utils/pharmacyAssertion.ts` | issuer ของ session assertion, ค่าเริ่มต้น `pharmacy-web` |
| `ACADEMY_MOCK_PAYMENTS_ENABLED` | `routes/academy.ts` | ปิด/เปิดปุ่มจำลองชำระเงิน; ปิดเป็นค่าเริ่มต้นใน production |
| Supabase URL/key variables | `utils/supabase.ts` | storage upload/delete/read |

ไม่ควร commit secret จริงลง repository
ใน production ต้องตั้ง `PHARMACY_ASSERTION_PUBLIC_JWK` และ key id ให้ตรงกับ signer; API ปฏิเสธ Pharmacy assertion หากไม่ตั้ง public key

## Database layer

| File | Purpose |
| --- | --- |
| `src/db/index.ts` | สร้าง `Pool` จาก `DATABASE_URL` และ export `db` |
| `src/db/schema.ts` | นิยาม table, enum และ field type ทั้งหมด |

## Main tables

| Table | Purpose |
| --- | --- |
| `users` | user ของ back-office |
| `permissions` | permission catalog |
| `role_permissions` | mapping role -> permission key |
| `home_content` | banner/popup หน้าแรกเว็บสภา |
| `pharmacist_home_content` | banner หน้า pharmacist/member |
| `web_settings` | ชื่อเว็บ โลโก้ slogan contact social |
| `news` | ข่าว |
| `medicine_articles` | บทความความรู้เรื่องยา |
| `public_project_articles` | โครงการของประชาชน |
| `laws` | กฎหมายตาม category |
| `services` | e-service/service item |
| `agencies` | หน่วยงาน/เครือข่าย |
| `council_members` | กรรมการสภา |
| `council_history` | ทำเนียบ/ประวัติ |
| `academy_*` | หมวดหมู่ คอร์ส ผู้เรียน คำสั่งซื้อ และการลงทะเบียน Pharmacy Academy |
| `honor_awards` | ประเภทรางวัลเกียรติประวัติ |
| `honors` | ผู้ได้รับรางวัล |
| `pharmacists` | รายชื่อเภสัชกร |
| `requests` | คำขอ |
| `request_shipping_details` | ข้อมูลจัดส่งของคำขอ |
| `request_payment_logs` | ประวัติชำระเงิน |
| `request_tax_invoices` | ข้อมูลใบกำกับภาษี |
| `policy_categories` | หมวดนโยบาย |
| `policy_projects` | โครงการภายใต้นโยบาย |

เพิ่มหรือเปลี่ยน schema ให้ตรวจ diff แล้วใช้ `npm run db:push` ตาม workflow ปัจจุบันของ API; คำสั่งนี้ยังไม่ได้รันกับฐานข้อมูลในงานนี้

## Auth and permission guard

ไฟล์หลัก: `src/utils/authGuard.ts`

Exports:

- `verifyToken` ตรวจ JWT
- `requireRole(...roles)` ตรวจ role แบบเก่า/compatibility
- `requirePermission(...permissionKeys)` ตรวจ permission จากตาราง `role_permissions`

Behavior:

- ถ้า token ไม่ถูกต้อง ตอบ `401`
- ถ้า user ไม่มีสิทธิ์ ตอบ `403`
- role `admin` ผ่านทุก permission
- role อื่นต้องมี permission key ใน DB

## Route reference

### Auth

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | public | login และออก JWT |
| `GET` | `/auth/me` | token | ข้อมูล user ปัจจุบัน |
| `POST` | `/auth/seed` | public/currently open | seed user เริ่มต้น |
| `GET` | `/auth/users` | `manage_users` | list users |
| `POST` | `/auth/users` | `manage_users` | create user |
| `DELETE` | `/auth/users/:id` | `manage_users` | delete user |

### Permissions

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/permissions` | `manage_roles` | list permissions |
| `POST` | `/permissions` | `manage_roles` | create permission |
| `DELETE` | `/permissions/:key` | `manage_roles` | delete permission |
| `GET` | `/permissions/roles` | `manage_roles` | list roles |
| `GET` | `/permissions/roles/:role` | `manage_roles` | permissions of role |
| `PUT` | `/permissions/roles/:role` | `manage_roles` | update permissions of role |
| `POST` | `/permissions/roles` | `manage_roles` | create role |
| `DELETE` | `/permissions/roles/:role` | `manage_roles` | delete role |
| `GET` | `/permissions/my` | token | permissions of current user |
| `POST` | `/permissions/seed` | `manage_roles` | seed permission catalog |

### Web settings and home content

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/web-settings` | public | get site settings |
| `POST` | `/web-settings` | `manage_web_settings` | update site settings |
| `GET` | `/home-content` | public | get public home banners/popups |
| `POST` | `/home-content` | `manage_home` | update public home content |
| `GET` | `/pharmacist-home-content` | public | get pharmacist/member banners |
| `POST` | `/pharmacist-home-content` | `manage_home` | update pharmacist/member banners |

### Content

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/news` | public | list news |
| `GET` | `/news/:id` | public | news detail |
| `POST` | `/news/upload-image` | `manage_news` | upload image for news/editor |
| `POST` | `/news` | `manage_news` | create news |
| `PUT` | `/news/:id` | `manage_news` | update news |
| `DELETE` | `/news/:id` | `manage_news` | delete news |
| `GET` | `/medicine` | public | list medicine articles |
| `GET` | `/medicine/:id` | public | medicine article detail |
| `POST` | `/medicine/upload-image` | `manage_news` | upload medicine image |
| `POST` | `/medicine` | `manage_news` | create medicine article |
| `PUT` | `/medicine/:id` | `manage_news` | update medicine article |
| `DELETE` | `/medicine/:id` | `manage_news` | delete medicine article |
| `GET` | `/public-project` | public | list public projects |
| `GET` | `/public-project/:id` | public | public project detail |
| `POST` | `/public-project/upload-image` | `manage_news` | upload public project image |
| `POST` | `/public-project` | `manage_news` | create public project |
| `PUT` | `/public-project/:id` | `manage_news` | update public project |
| `DELETE` | `/public-project/:id` | `manage_news` | delete public project |

### Organization data

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/council` | public | list council members |
| `POST` | `/council` | `manage_about` | create council member |
| `PUT` | `/council/:id` | `manage_about` | update council member |
| `PUT` | `/council/reorder` | `manage_about` | reorder council members |
| `DELETE` | `/council/:id` | `manage_about` | delete council member |
| `GET` | `/history` | public | list council history |
| `POST` | `/history` | `manage_about` | create history item |
| `PUT` | `/history/:id` | `manage_about` | update history item |
| `DELETE` | `/history/:id` | `manage_about` | delete history item |
| `GET` | `/agencies` | public | list agencies |
| `POST` | `/agencies` | `manage_agency` | create agency |
| `PUT` | `/agencies/:id` | `manage_agency` | update agency |
| `PUT` | `/agencies/reorder` | `manage_agency` | reorder agencies |
| `DELETE` | `/agencies/:id` | `manage_agency` | delete agency |

### Laws, services, honor, policy

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/laws/:category` | public | list laws by category |
| `POST` | `/laws` | `manage_law` | create law |
| `PUT` | `/laws/:id` | `manage_law` | update law |
| `PUT` | `/laws/reorder` | `manage_law` | reorder laws |
| `DELETE` | `/laws/:id` | `manage_law` | delete law |
| `GET` | `/services` | public | list services |
| `GET` | `/services/popular` | public | list popular services |
| `POST` | `/services` | `manage_service` | create service |
| `PUT` | `/services/:id` | `manage_service` | update service |
| `PUT` | `/services/reorder` | `manage_service` | reorder services |
| `DELETE` | `/services/:id` | `manage_service` | delete service |
| `GET` | `/honor-awards` | public | list awards |
| `POST` | `/honor-awards` | `manage_about` | create award |
| `PUT` | `/honor-awards/:id` | `manage_about` | update award |
| `PUT` | `/honor-awards/reorder` | `manage_about` | reorder awards |
| `DELETE` | `/honor-awards/:id` | `manage_about` | delete award |
| `GET` | `/honor` | public | list honor recipients |
| `POST` | `/honor` | `manage_about` | create recipient |
| `PUT` | `/honor/:id` | `manage_about` | update recipient |
| `PUT` | `/honor/reorder` | `manage_about` | reorder recipients |
| `DELETE` | `/honor/:id` | `manage_about` | delete recipient |
| `GET` | `/policy-categories` | public | list policy categories |
| `GET` | `/policy-categories/:id` | public | policy category detail |
| `POST` | `/policy-categories` | `manage_about` | create category |
| `PUT` | `/policy-categories/:id` | `manage_about` | update category |
| `PUT` | `/policy-categories/reorder` | `manage_about` | reorder categories |
| `DELETE` | `/policy-categories/:id` | `manage_about` | delete category |
| `GET` | `/policy-projects` | public | list policy projects |
| `POST` | `/policy-projects` | `manage_about` | create project |
| `PUT` | `/policy-projects/:id` | `manage_about` | update project |
| `PUT` | `/policy-projects/reorder` | `manage_about` | reorder projects |
| `DELETE` | `/policy-projects/:id` | `manage_about` | delete project |

### Pharmacists and requests

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/pharmacists` | public | list/search pharmacists |
| `GET` | `/pharmacists/:id` | public | pharmacist detail |
| `GET` | `/requests` | `manage_register` | list requests |
| `GET` | `/requests/:id` | `manage_register` | request detail |
| `POST` | `/requests` | token | create request |
| `PUT` | `/requests/:id` | `manage_register` | update request |
| `POST` | `/requests/:id/payment` | token | create payment record |
| `DELETE` | `/requests/:id` | `manage_register` | delete request |

## Upload helpers

| File | Purpose |
| --- | --- |
| `src/utils/supabase.ts` | สร้าง Supabase client |
| `src/utils/upload.ts` | upload file/image ไป storage และคืน URL |

Routes ที่มี upload:

- home content banners
- pharmacist home banners
- web settings logo
- news image/thumbnail/editor image
- medicine image
- public project image
- council/history/agency/honor image
- laws PDF

## Integration notes

- Backend เป็น source of truth ของ schema และ permission
- Public GET endpoints ถูกใช้โดย `01_pharmacy-web`
- Protected write endpoints ถูกใช้โดย `02_back-office`
- ถ้าเพิ่ม feature ใหม่ ควรเริ่มจาก schema และ route ก่อน แล้วค่อยเชื่อม back-office และเว็บหน้า

