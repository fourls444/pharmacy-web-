import type { AcademyCourse, AcademyEnrollment, AcademyOrder } from './client';

const STORAGE_KEY = 'pharmacy-academy-local-registration-v1';

interface LocalStore {
  enrollments: AcademyEnrollment[];
  orders: AcademyOrder[];
  nextOrderId: number;
}

function readStore(): LocalStore {
  if (typeof window === 'undefined') return { enrollments: [], orders: [], nextOrderId: 8001 };
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as LocalStore;
      if (Array.isArray(parsed.enrollments) && Array.isArray(parsed.orders)) return parsed;
    }
  } catch { /* Reset invalid local data. */ }
  return { enrollments: [], orders: [], nextOrderId: 8001 };
}

function saveStore(store: LocalStore) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function enroll(store: LocalStore, courseId: number): AcademyEnrollment {
  const existing = store.enrollments.find((item) => item.courseId === courseId && item.status === 'active');
  if (existing) return existing;
  const enrollment: AcademyEnrollment = { courseId, status: 'active', enrolledAt: new Date().toISOString() };
  store.enrollments.push(enrollment);
  return enrollment;
}

export const localRegistration = {
  getEnrollments() {
    return readStore().enrollments.filter((item) => item.status === 'active');
  },
  createOrder(course: AcademyCourse): { type: 'enrolled'; enrollment: AcademyEnrollment } | { type: 'payment_required'; order: AcademyOrder } {
    const store = readStore();
    const existing = store.enrollments.find((item) => item.courseId === course.id && item.status === 'active');
    if (existing) return { type: 'enrolled', enrollment: existing };
    if (Number(course.price) <= 0) {
      const enrollment = enroll(store, course.id);
      saveStore(store);
      return { type: 'enrolled', enrollment };
    }
    const pending = store.orders.find((item) => item.courseId === course.id && item.status === 'pending');
    if (pending) return { type: 'payment_required', order: pending };
    const order: AcademyOrder = {
      id: store.nextOrderId++, courseId: course.id, courseTitle: course.title,
      amountSnapshot: String(course.price), status: 'pending',
    };
    store.orders.push(order);
    saveStore(store);
    return { type: 'payment_required', order };
  },
  getOrder(orderId: number): AcademyOrder {
    const order = readStore().orders.find((item) => item.id === orderId);
    if (!order) throw Object.assign(new Error('ไม่พบคำสั่งซื้อจำลอง'), { status: 404 });
    return order;
  },
  completeOrder(orderId: number): { status: 'mock_paid'; enrollment: AcademyEnrollment } {
    const store = readStore();
    const order = store.orders.find((item) => item.id === orderId);
    if (!order) throw Object.assign(new Error('ไม่พบคำสั่งซื้อจำลอง'), { status: 404 });
    if (order.status === 'cancelled') throw Object.assign(new Error('คำสั่งซื้อนี้ถูกยกเลิกแล้ว'), { status: 409 });
    order.status = 'mock_paid';
    const enrollment = enroll(store, order.courseId);
    saveStore(store);
    return { status: 'mock_paid', enrollment };
  },
};
