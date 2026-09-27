# 01_pharmacy-web

`01_pharmacy-web` คือเว็บหน้าบ้านของสภาเภสัชกรรม ใช้ Next.js App Router แบ่งพื้นที่เป็น public และ member ผ่าน route group:

- `app/(public)` สำหรับผู้ใช้ทั่วไป
- `app/(member)` สำหรับสมาชิก/เภสัชกรหลัง login
- `app/login` สำหรับหน้า login ฝั่ง member

## Technology stack

| Area | Implementation |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19 |
| Styling | CSS Modules, Tailwind v4, global CSS |
| Font | `Kanit`, `Geist`, `Geist_Mono` ผ่าน `next/font` |
| Carousel | `swiper` |
| Icons | `lucide-react`, `react-icons` |
| Map/stat visualization | `react-simple-maps`, `d3-scale` |

## Root files

| File | Purpose |
| --- | --- |
| `package.json` | scripts และ dependency ของเว็บหน้าบ้าน |
| `next.config.ts` | remote image allowlist, route rewrites, API proxy |
| `middleware.ts` | redirect/rewrite ตามสถานะ login |
| `tsconfig.json` | TypeScript config และ path alias |
| `postcss.config.mjs` | Tailwind/PostCSS setup |
| `eslint.config.mjs` | ESLint config |
| `README.md` | README จาก create-next-app |

## App shell

| File | Purpose |
| --- | --- |
| `app/layout.tsx` | Root layout ของทั้งเว็บ โหลด fonts, global CSS, `Providers`, `AppHeader`, `Footer` |
| `app/page.tsx` | redirect `/` ไป `/home` |
| `app/globals.css` | global style, Tailwind import, font class, overflow fix |
| `components/ui/Providers.tsx` | รวม provider ฝั่ง client ปัจจุบันคือ `AuthProvider` |
| `components/ui/AppHeader.tsx` | เลือก navbar ตามสถานะ login |
| `components/ui/Navbar.tsx` | navbar สำหรับ public user |
| `components/ui/MemberNavbar.tsx` | navbar สำหรับ member user |
| `components/ui/Footer.tsx` | footer กลางของเว็บ |

## Routing และ rewrite

ชื่อ folder จริงใช้เลขนำหน้าเพื่อจัดลำดับ เช่น `01_home`, `02_about` แต่ URL จริงถูก rewrite ใน `next.config.ts`

| Public URL | Internal page |
| --- | --- |
| `/home` | `app/(public)/01_home/page.tsx` |
| `/about` | `app/(public)/02_about/page.tsx` |
| `/about/committee` | `app/(public)/02_about/committee/page.tsx` |
| `/about/council-directory` | `app/(public)/02_about/council-directory/page.tsx` |
| `/about/hall-of-fame` | `app/(public)/02_about/hall-of-fame/page.tsx` |
| `/about/members` | `app/(public)/02_about/members/page.tsx` |
| `/about/policy` | `app/(public)/02_about/policy/page.tsx` |
| `/department` | `app/(public)/03_department/page.tsx` |
| `/service` | `app/(public)/04_service/page.tsx` |
| `/meeting` | `app/(public)/05_meeting/page.tsx` |
| `/news` | `app/(public)/06_news/page.tsx` |
| `/news/:id` | `app/(public)/06_news/[id]/page.tsx` |
| `/laws` | `app/(public)/07_laws/page.tsx` |
| `/other-service` | `app/(public)/08_other-service/page.tsx` |
| `/contact` | `app/(public)/09_contact/page.tsx` |

| Member URL | Internal page |
| --- | --- |
| `/member-home` | `app/(member)/01_member-home/page.tsx` |
| `/profile` | `app/(member)/02_profile/page.tsx` |
| `/member-service` | `app/(member)/03_member-service/page.tsx` |
| `/member-meeting` | `app/(member)/04_member-meeting/page.tsx` |
| `/learning` | `app/(member)/05_learning/page.tsx` |
| `/learning/courses` | `app/(member)/05_learning/courses/page.tsx` |
| `/careers` | `app/(member)/06_careers/page.tsx` |
| `/tools` | `app/(member)/07_tools/page.tsx` |
| `/store` | `app/(member)/08_store/page.tsx` |

## Middleware behavior

`middleware.ts` ใช้ cookie `isLoggedIn` เพื่อตัดสินใจ

| Condition | Behavior |
| --- | --- |
| path เป็น `/` | redirect ไป `/home` |
| login แล้วเข้า `/home` | rewrite ไป `/member-home` |
| login แล้วเข้า `/service` | rewrite ไป `/member-service` |
| login แล้วเข้า `/meeting` | rewrite ไป `/member-meeting` |
| ยังไม่ login แล้วเข้า member route | redirect ไป `/login` |
| login แล้วเข้า `/login` | redirect ไป `/home` |

ข้อสังเกต: auth ของเว็บนี้เป็น client/member simulation มากกว่า back-office JWT auth เพราะใช้ `isLoggedIn=true` ใน localStorage/cookie ไม่ได้เรียก `/auth/login` ของ backend

## Auth context

`context/AuthContext.tsx` ทำหน้าที่:

- โหลด `isLoggedIn` จาก `localStorage`
- sync สถานะ login ไป cookie `isLoggedIn`
- expose `login()` และ `logout()`
- เก็บ mock user display เช่น `userName`, `userId`

การออกแบบนี้ทำให้ middleware อ่าน cookie ได้ ส่วน component อ่าน React context ได้

## API client

`lib/api.ts` เป็น API client หลักของเว็บหน้าบ้าน

Base URL:

```ts
process.env.NEXT_PUBLIC_API_URL
```

Pharmacy Academy ใช้ server route `/api/academy/*` เป็น proxy เพื่อผูก session สมาชิกกับ assertion ที่ลงนามก่อนส่งคำขอที่ต้องยืนยันตัวตนไปยัง API; ตั้ง `PHARMACY_ASSERTION_PRIVATE_JWK` ใน production และตั้ง public key คู่กันใน `03_backend-api` ผ่าน `PHARMACY_ASSERTION_PUBLIC_JWK` โดยให้ key id ตรงกัน

ถ้าไม่มี env:

- server side fallback ไป `https://pharmacy-api-6w5d.onrender.com`
- browser side fallback ไป `/api/proxy`

ฟังก์ชันสำคัญ:

| Function | Endpoint | Used for |
| --- | --- | --- |
| `getWebSettings()` | `/web-settings` | ชื่อเว็บ โลโก้ slogan contact |
| `getNews()` | `/news` | ข่าวทั้งหมด |
| `getNewsById(id)` | `/news/:id` | รายละเอียดข่าว |
| `getHomeContent()` | `/home-content` | banner และ popup หน้า home public |
| `getPharmacistHomeContent()` | `/pharmacist-home-content` | banner หน้า member/pharmacist |
| `getAgencies()` | `/agencies` | หน่วยงาน |
| `getLawsByCategory(category)` | `/laws/:category` | กฎหมายตามหมวด |
| `getServices()` | `/services` | งานบริการทั้งหมด |
| `getPopularServices()` | `/services/popular` | บริการยอดนิยม |
| `getPolicyCategories()` | `/policy-categories` | หมวดนโยบาย |
| `getPolicyProjects(categoryId)` | `/policy-projects?categoryId=...` | โครงการภายใต้นโยบาย |
| `getHistory()` | `/history` | ทำเนียบ/ประวัติ |
| `getHonorAwards()` | `/honor-awards` | รางวัลเกียรติประวัติ |
| `getHonorRecipients()` | `/honor` | ผู้ได้รับรางวัล |

บาง component ยังเรียก `/api/proxy` โดยตรง เช่น hall of fame, committee และ council directory เพื่อให้ browser fetch ผ่าน rewrite proxy

## Component organization

```text
components/
  ui/          shared UI used across pages
  public/      components for public pages
  member/      components for member pages
```

### `components/ui`

| File | Purpose |
| --- | --- |
| `AppHeader.tsx` | เลือก public/member navbar |
| `Navbar.tsx` | public navigation |
| `MemberNavbar.tsx` | member navigation พร้อม user info/logout |
| `Footer.tsx` | footer กลาง |
| `Container.tsx` | layout container |
| `SectionHeader.tsx` | heading pattern |
| `Badge.tsx` | badge UI |
| `CarouselButtons.tsx` | ปุ่ม carousel |
| `DotPagination.tsx` | dot pagination |

### `components/public`

แยกตามเลขหน้า เช่น:

- `01_home` banner, license search, stats, news, meetings, service section
- `02_about` sidebar, committee, council directory, members, policy
- `03_department` stats, agencies, colleges, institutions, network
- `04_service` service banner และ public services
- `05_meeting` banner, list, pagination, recommended meeting
- `06_news` news card, featured news, container
- `07_laws` laws content, search, sidebar, list
- `08_other-service` document search
- `09_contact` contact content

### `components/member`

- `home` member home sections
- `profile` profile banner, pharmacist info, credit/course/meeting sections
- `service` popular service และ service list
- `learning` course/category/stats/reviews/instructors
- `learning/courses` course card/filter
- `careers` job banner/filter/list/card
- `store` StoreBanner, FeaturedProducts, ProductCard, ProductGrid, StoreSearch, CategoryHighlights, StoreFeatures

หมายเหตุ: หน้า `07_tools` (`app/(member)/07_tools/page.tsx`) implement UI ตรงใน page file ไม่มี component แยก

## Public assets

`public/` เก็บ static assets:

- `public/images/public/...` รูปหน้าเว็บ public
- `public/images/public/login/...` รูป provider/login
- `public/images/careers/...` รูปหน้า careers
- `public/data/thailand.json` map/topology data
- `public/data/pharmacist-stats.json` stats static
- `public/data/ข้อมูลจังหวัด และสถานะใบอนุญาต.csv` source data ที่ใช้สร้าง stats

`scripts/process-pharmacists.js` เป็น script สำหรับประมวลผลข้อมูลเภสัชกร/stat จากไฟล์ data

## Styling pattern

- Global style อยู่ที่ `app/globals.css`
- Page-specific style ใช้ `*.module.css` ข้าง `page.tsx`
- Component-specific style ใช้ `ComponentName.module.css`
- Tailwind ใช้ร่วมกับ CSS Modules โดยเฉพาะใน layout/global classes

## Known integration notes

- Web public ใช้ข้อมูลเดียวกับ back-office ผ่าน backend API
- Route `/api/proxy/:path*` ใน `next.config.ts` proxy ไป production API
- Member login ของ `01_pharmacy-web` ไม่ใช่ JWT login แบบ `02_back-office`
- ถ้าเพิ่มข้อมูลใหม่ที่ต้องแสดงหน้าเว็บ ควรเพิ่มตามลำดับนี้: backend schema/route -> back-office CRUD -> frontend API client/component

