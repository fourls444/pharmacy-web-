import type {
  AcademyCategory,
  AcademyCourse,
  AcademyEnrollment,
  AcademyOrder,
  AcademyPage,
} from './client';

const STORAGE_KEY = 'pharmacy-academy-mock-v1';
const PAGE_SIZE_DEFAULT = 12;

const mockCourses: AcademyCourse[] = [
  {
    id: 1,
    title: "การจัดการความดันโลหิตสูงในผู้ป่วยสูงอายุ",
    summary: "เรียนรู้แนวทางการจัดการยาและข้อควรระวังในการรักษาโรคความดันโลหิตสูงในกลุ่มผู้ป่วยสูงอายุ",
    details: "แนวทางการเลือกใช้ยาความดันในผู้สูงอายุ การจัดการผลข้างเคียงและปฏิกิริยาระหว่างยา พร้อมกรณีศึกษาผู้ป่วยซับซ้อน",
    learningOutcomes: ['ทบทวนหลักการเลือกใช้ยาในผู้ป่วยสูงอายุ', 'ประเมินผลข้างเคียงและปฏิกิริยาระหว่างยา', 'นำแนวทางไปใช้กับกรณีศึกษาผู้ป่วย'],
    curriculum: ['การประเมินผู้ป่วยและเป้าหมายการรักษา', 'การเลือกใช้ยาและการติดตามผล', 'กรณีศึกษาและการทบทวนความรู้'],
    instructorName: 'ภก. ดร. สมชาย รักดี',
    thumbnailUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600&auto=format&fit=crop",
    durationMinutes: 150,
    cpeCredits: 2.5,
    price: 0,
    maxStudents: 300,
    enrollmentDeadline: null,
    categoryId: 2,
    categoryName: "เภสัชกรรมโรงพยาบาล",
    status: 'published',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 2,
    title: "ทักษะการสื่อสารเพื่อการดูแลผู้ป่วยเบาหวาน",
    summary: "หลักสูตรทักษะการสื่อสารเพื่อการดูแลผู้ป่วยเบาหวาน สำหรับการพัฒนาความรู้และทักษะวิชาชีพเภสัชกรรม",
    details: "เรียนรู้หัวข้อทักษะการสื่อสารเพื่อการดูแลผู้ป่วยเบาหวาน ผ่านเนื้อหาและตัวอย่างการปฏิบัติงาน พร้อมทบทวนความรู้ก่อนนำไปใช้จริง",
    learningOutcomes: ['สื่อสารข้อมูลการใช้ยาให้ผู้ป่วยเข้าใจ', 'รับฟังปัญหาและวางแผนการดูแลร่วมกับผู้ป่วย'],
    curriculum: ['หลักการสื่อสารกับผู้ป่วยเบาหวาน', 'สถานการณ์ตัวอย่างในการให้คำปรึกษา', 'ทบทวนแนวทางการติดตามผู้ป่วย'],
    instructorName: 'ทีมวิทยากร Pharmacy Academy',
    thumbnailUrl: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?q=80&w=600&auto=format&fit=crop",
    durationMinutes: 90,
    cpeCredits: 1.5,
    price: 490,
    maxStudents: 300,
    enrollmentDeadline: null,
    categoryId: 1,
    categoryName: "เภสัชกรรมชุมชน",
    status: 'published',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 3,
    title: "เภสัชกรรมคลินิกในโรคไตเรื้อรัง",
    summary: "บทบาทเภสัชกรคลินิกในการดูแลผู้ป่วยโรคไตเรื้อรัง ตั้งแต่การปรับขนาดยาไปจนถึงการติดตามค่าไต",
    details: "การคำนวณ GFR การปรับขนาดยา การจัดการภาวะแทรกซ้อน และการดูแลผู้ป่วยร่วมกับทีมสหสาขาวิชาชีพ",
    learningOutcomes: ['ประเมินการทำงานของไตเพื่อประกอบการใช้ยา', 'พิจารณาการปรับขนาดยาในผู้ป่วยโรคไตเรื้อรัง'],
    curriculum: ['การประเมินค่าไต', 'การปรับขนาดยาและการติดตาม', 'การดูแลร่วมกับทีมสหสาขาวิชาชีพ'],
    instructorName: 'ภญ. วิภาวดี เรียนรู้',
    thumbnailUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=600&auto=format&fit=crop",
    durationMinutes: 180,
    cpeCredits: 3,
    price: 490,
    maxStudents: 300,
    enrollmentDeadline: null,
    categoryId: 7,
    categoryName: "เภสัชบำบัด",
    status: 'published',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 4,
    title: "การบริบาลทางเภสัชกรรมในผู้ป่วยมะเร็ง",
    summary: "หลักสูตรการบริบาลทางเภสัชกรรมในผู้ป่วยมะเร็ง สำหรับการพัฒนาความรู้และทักษะวิชาชีพเภสัชกรรม",
    details: "เรียนรู้หัวข้อการบริบาลทางเภสัชกรรมในผู้ป่วยมะเร็ง ผ่านเนื้อหาและตัวอย่างการปฏิบัติงาน พร้อมทบทวนความรู้ก่อนนำไปใช้จริง",
    learningOutcomes: ['ทบทวนบทบาทเภสัชกรในการดูแลผู้ป่วยมะเร็ง', 'ติดตามปัญหาจากการใช้ยาและให้คำแนะนำผู้ป่วย'],
    curriculum: ['พื้นฐานการบริบาลผู้ป่วยมะเร็ง', 'การติดตามอาการไม่พึงประสงค์', 'กรณีศึกษาในการดูแลผู้ป่วย'],
    instructorName: 'ทีมวิทยากร Pharmacy Academy',
    thumbnailUrl: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?q=80&w=600&auto=format&fit=crop",
    durationMinutes: 120,
    cpeCredits: 2,
    price: 490,
    maxStudents: 300,
    enrollmentDeadline: null,
    categoryId: 2,
    categoryName: "เภสัชกรรมโรงพยาบาล",
    status: 'published',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 5,
    title: "การประเมินความปลอดภัยของผลิตภัณฑ์สมุนไพร",
    summary: "หลักสูตรการประเมินความปลอดภัยของผลิตภัณฑ์สมุนไพร สำหรับการพัฒนาความรู้และทักษะวิชาชีพเภสัชกรรม",
    details: "เรียนรู้หัวข้อการประเมินความปลอดภัยของผลิตภัณฑ์สมุนไพร ผ่านเนื้อหาและตัวอย่างการปฏิบัติงาน พร้อมทบทวนความรู้ก่อนนำไปใช้จริง",
    learningOutcomes: ['พิจารณาข้อมูลความปลอดภัยของผลิตภัณฑ์สมุนไพร', 'ระบุข้อควรระวังเมื่อใช้ร่วมกับยา'],
    curriculum: ['ข้อมูลที่ใช้ประเมินผลิตภัณฑ์', 'ข้อควรระวังและปฏิกิริยากับยา', 'ตัวอย่างการประเมินความปลอดภัย'],
    instructorName: 'ทีมวิทยากร Pharmacy Academy',
    thumbnailUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=600&auto=format&fit=crop",
    durationMinutes: 240,
    cpeCredits: 4,
    price: 490,
    maxStudents: 300,
    enrollmentDeadline: null,
    categoryId: 3,
    categoryName: "เภสัชกรรมสมุนไพร",
    status: 'published',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 6,
    title: "กฎหมายและจรรยาบรรณวิชาชีพเภสัชกรรม 2024",
    summary: "หลักสูตรกฎหมายและจรรยาบรรณวิชาชีพเภสัชกรรม 2024 สำหรับการพัฒนาความรู้และทักษะวิชาชีพเภสัชกรรม",
    details: "เรียนรู้หัวข้อกฎหมายและจรรยาบรรณวิชาชีพเภสัชกรรม 2024 ผ่านเนื้อหาและตัวอย่างการปฏิบัติงาน พร้อมทบทวนความรู้ก่อนนำไปใช้จริง",
    learningOutcomes: ['ทบทวนหลักกฎหมายที่เกี่ยวข้องกับการปฏิบัติงาน', 'วิเคราะห์สถานการณ์ด้านจรรยาบรรณวิชาชีพ'],
    curriculum: ['กรอบกฎหมายวิชาชีพ', 'หลักจรรยาบรรณในการปฏิบัติงาน', 'กรณีศึกษาและการทบทวน'],
    instructorName: 'ทีมวิทยากร Pharmacy Academy',
    thumbnailUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=600&auto=format&fit=crop",
    durationMinutes: 90,
    cpeCredits: 1.5,
    price: 490,
    maxStudents: 300,
    enrollmentDeadline: null,
    categoryId: 4,
    categoryName: "กฎหมายและจริยธรรม",
    status: 'published',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 7,
    title: "เทคโนโลยี AI ในงานเภสัชกรรมสมัยใหม่",
    summary: "หลักสูตรเทคโนโลยี AI ในงานเภสัชกรรมสมัยใหม่ สำหรับการพัฒนาความรู้และทักษะวิชาชีพเภสัชกรรม",
    details: "เรียนรู้หัวข้อเทคโนโลยี AI ในงานเภสัชกรรมสมัยใหม่ ผ่านเนื้อหาและตัวอย่างการปฏิบัติงาน พร้อมทบทวนความรู้ก่อนนำไปใช้จริง",
    learningOutcomes: ['รู้จักตัวอย่างการใช้ AI ในงานเภสัชกรรม', 'ประเมินข้อจำกัดของข้อมูลและผลลัพธ์จาก AI'],
    curriculum: ['ภาพรวม AI ในงานเภสัชกรรม', 'ตัวอย่างการประยุกต์ใช้', 'ข้อจำกัดและการตรวจสอบผลลัพธ์'],
    instructorName: 'ทีมวิทยากร Pharmacy Academy',
    thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
    durationMinutes: 150,
    cpeCredits: 2.5,
    price: 490,
    maxStudents: 300,
    enrollmentDeadline: null,
    categoryId: 5,
    categoryName: "เภสัชศาสตร์นวัตกรรม",
    status: 'published',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 8,
    title: "การจัดการคลังยาและโลจิสติกส์การแพทย์",
    summary: "หลักสูตรการจัดการคลังยาและโลจิสติกส์การแพทย์ สำหรับการพัฒนาความรู้และทักษะวิชาชีพเภสัชกรรม",
    details: "เรียนรู้หัวข้อการจัดการคลังยาและโลจิสติกส์การแพทย์ ผ่านเนื้อหาและตัวอย่างการปฏิบัติงาน พร้อมทบทวนความรู้ก่อนนำไปใช้จริง",
    learningOutcomes: ['วางแนวทางติดตามจำนวนยาคงคลัง', 'ทบทวนขั้นตอนจัดเก็บและกระจายยา'],
    curriculum: ['การวางแผนคลังยา', 'การจัดเก็บและการติดตาม', 'ตัวอย่างการจัดการโลจิสติกส์'],
    instructorName: 'ทีมวิทยากร Pharmacy Academy',
    thumbnailUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=600&auto=format&fit=crop",
    durationMinutes: 180,
    cpeCredits: 3,
    price: 490,
    maxStudents: 300,
    enrollmentDeadline: null,
    categoryId: 6,
    categoryName: "การบริหารเภสัชกิจ",
    status: 'published',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
  {
    id: 9,
    title: "จิตวิทยาการบริการสำหรับเภสัชกรชุมชน",
    summary: "หลักสูตรจิตวิทยาการบริการสำหรับเภสัชกรชุมชน สำหรับการพัฒนาความรู้และทักษะวิชาชีพเภสัชกรรม",
    details: "เรียนรู้หัวข้อจิตวิทยาการบริการสำหรับเภสัชกรชุมชน ผ่านเนื้อหาและตัวอย่างการปฏิบัติงาน พร้อมทบทวนความรู้ก่อนนำไปใช้จริง",
    learningOutcomes: ['เข้าใจปัจจัยที่มีผลต่อการสื่อสารกับผู้รับบริการ', 'ปรับวิธีให้คำแนะนำตามสถานการณ์'],
    curriculum: ['พื้นฐานจิตวิทยาการบริการ', 'การรับฟังและการสื่อสาร', 'สถานการณ์ตัวอย่างในร้านยา'],
    instructorName: 'ทีมวิทยากร Pharmacy Academy',
    thumbnailUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600&auto=format&fit=crop",
    durationMinutes: 120,
    cpeCredits: 2,
    price: 490,
    maxStudents: 300,
    enrollmentDeadline: null,
    categoryId: 1,
    categoryName: "เภสัชกรรมชุมชน",
    status: 'published',
    createdAt: '2026-08-15T09:00:00.000Z',
  },
];

interface MockStore {
  nextOrderId: number;
  nextEnrollmentId: number;
  orders: AcademyOrder[];
  enrollments: AcademyEnrollment[];
}

class MockResponseError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

function emptyStore(): MockStore {
  return { nextOrderId: 8001, nextEnrollmentId: 9001, orders: [], enrollments: [] };
}

function readStore(): MockStore {
  if (typeof window === 'undefined') return emptyStore();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return emptyStore();
    const parsed = JSON.parse(saved) as Partial<MockStore>;
    return {
      nextOrderId: Number.isInteger(parsed.nextOrderId) ? Number(parsed.nextOrderId) : 8001,
      nextEnrollmentId: Number.isInteger(parsed.nextEnrollmentId) ? Number(parsed.nextEnrollmentId) : 9001,
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      enrollments: Array.isArray(parsed.enrollments) ? parsed.enrollments : [],
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: MockStore) {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function getCourse(courseId: number) {
  const course = mockCourses.find((item) => item.id === courseId);
  if (!course) throw new MockResponseError('ไม่พบคอร์สตัวอย่าง', 404);
  return course;
}

function makeEnrollment(store: MockStore, courseId: number): AcademyEnrollment {
  const existing = store.enrollments.find((item) => item.courseId === courseId && item.status === 'active');
  if (existing) return existing;
  const enrollment: AcademyEnrollment = {
    courseId,
    enrollmentId: store.nextEnrollmentId++,
    status: 'active',
    enrolledAt: new Date().toISOString(),
  };
  store.enrollments.push(enrollment);
  return enrollment;
}

function assertCapacity(store: MockStore, course: AcademyCourse) {
  if (course.enrollmentDeadline && new Date(course.enrollmentDeadline).getTime() < Date.now()) {
    throw new MockResponseError('คอร์สปิดรับสมัครแล้ว', 409);
  }
  const activeCount = store.enrollments.filter((item) => item.courseId === course.id && item.status === 'active').length;
  if (course.maxStudents && activeCount >= course.maxStudents) {
    throw new MockResponseError('คอร์สมีผู้ลงทะเบียนครบแล้ว', 409);
  }
}

export const mockAcademy = {
  listCategories(): AcademyCategory[] {
    const counts = new Map<number, number>();
    const categories = new Map<number, string>();
    for (const course of mockCourses) {
      if (course.categoryId === null || !course.categoryName) continue;
      counts.set(course.categoryId, (counts.get(course.categoryId) ?? 0) + 1);
      categories.set(course.categoryId, course.categoryName);
    }
    return [...categories.entries()]
      .map(([id, name]) => ({ id, name, count: counts.get(id) ?? 0 }))
      .sort((left, right) => left.name.localeCompare(right.name, 'th'));
  },

  listCourses(params: { search?: string; categoryId?: number | null; page?: number; limit?: number } = {}): AcademyPage<AcademyCourse> {
    const query = params.search?.trim().toLocaleLowerCase('th') ?? '';
    const filtered = mockCourses.filter((course) => {
      const matchesCategory = !params.categoryId || course.categoryId === params.categoryId;
      const searchable = `${course.title} ${course.summary ?? ''} ${course.instructorName ?? ''} ${course.categoryName ?? ''}`.toLocaleLowerCase('th');
      return matchesCategory && (!query || searchable.includes(query));
    });
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? PAGE_SIZE_DEFAULT);
    const offset = (page - 1) * limit;
    return { items: filtered.slice(offset, offset + limit), page, limit, total: filtered.length };
  },

  getCourse(courseId: number): AcademyCourse {
    return getCourse(courseId);
  },

  getEnrollments(): AcademyEnrollment[] {
    return readStore().enrollments.filter((item) => item.status === 'active');
  },

  createOrder(courseId: number): { type: 'enrolled'; enrollment: AcademyEnrollment } | { type: 'payment_required'; order: AcademyOrder } {
    const course = getCourse(courseId);
    const store = readStore();
    const existingEnrollment = store.enrollments.find((item) => item.courseId === courseId && item.status === 'active');
    if (existingEnrollment) return { type: 'enrolled', enrollment: existingEnrollment };
    assertCapacity(store, course);

    if (Number(course.price) <= 0) {
      const enrollment = makeEnrollment(store, courseId);
      writeStore(store);
      return { type: 'enrolled', enrollment };
    }

    const pending = store.orders.find((item) => item.courseId === courseId && item.status === 'pending');
    if (pending) return { type: 'payment_required', order: pending };
    const order: AcademyOrder = {
      id: store.nextOrderId++,
      courseId,
      courseTitle: course.title,
      amountSnapshot: String(course.price),
      status: 'pending',
    };
    store.orders.push(order);
    writeStore(store);
    return { type: 'payment_required', order };
  },

  getOrder(orderId: number): AcademyOrder {
    const order = readStore().orders.find((item) => item.id === orderId);
    if (!order) throw new MockResponseError('ไม่พบคำสั่งซื้อตัวอย่าง', 404);
    return order;
  },

  completeOrder(orderId: number): { status: 'mock_paid'; enrollment: AcademyEnrollment } {
    const store = readStore();
    const order = store.orders.find((item) => item.id === orderId);
    if (!order) throw new MockResponseError('ไม่พบคำสั่งซื้อตัวอย่าง', 404);
    if (order.status === 'cancelled') throw new MockResponseError('คำสั่งซื้อนี้ถูกยกเลิกแล้ว', 409);
    if (order.status === 'pending') {
      const course = getCourse(order.courseId);
      assertCapacity(store, course);
      order.status = 'mock_paid';
    }
    const enrollment = makeEnrollment(store, order.courseId);
    writeStore(store);
    return { status: 'mock_paid', enrollment };
  },
};

export function runMock<T>(operation: () => T): Promise<T> {
  try {
    return Promise.resolve(operation());
  } catch (reason) {
    if (reason instanceof MockResponseError) return Promise.reject(new ErrorWithStatus(reason.message, reason.status));
    return Promise.reject(reason);
  }
}

class ErrorWithStatus extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}
