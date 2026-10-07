import { IncomingAcademyCategory, IncomingAcademyCourse, mapIncomingCategory, mapIncomingCourse, pageIncomingCourses } from './incoming';
import { localRegistration } from './local-registration';

export interface AcademyCategory {
  id: number;
  name: string;
  count: number;
  imageUrl?: string | null;
  color?: string | null;
}

export interface AcademyCourse {
  id: number;
  title: string;
  summary: string | null;
  details?: string | null;
  learningOutcomes?: string[];
  curriculum?: string[];
  instructorName: string | null;
  thumbnailUrl: string | null;
  durationMinutes: number;
  durationLabel?: string | null;
  cpeCredits: number | string;
  price: number | string;
  maxStudents?: number | null;
  enrollmentDeadline?: string | null;
  categoryId: number | null;
  categoryName: string | null;
  format?: 'online' | 'onsite';
  venue?: string | null;
  trainingStartsAt?: string | null;
  trainingEndsAt?: string | null;
  status?: 'draft' | 'published' | 'archived';
  createdAt?: string;
  isFeatured?: boolean;
}

export interface AcademyInstructor { id: number; name: string; title: string | null; expertise: string | null; imageUrl: string | null }
export interface AcademyReview { id: number; courseId?: number; rating: number; body: string; reviewerName: string; reviewerRole: string | null; courseTitle: string | null }
export interface AcademyStats { courseCount: number; learnerCount: number; instructorCount: number }

export interface AcademyPage<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface AcademyEnrollment {
  courseId: number;
  enrollmentId?: number;
  status: 'active' | 'cancelled';
  enrolledAt?: string;
}

export interface AcademyOrder {
  id: number;
  courseId: number;
  courseTitle?: string;
  amountSnapshot: string;
  status: 'pending' | 'mock_paid' | 'cancelled';
}

export class AcademyError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'AcademyError';
  }
}

function localCall<T>(operation: () => T): Promise<T> {
  return Promise.resolve().then(operation).catch((reason: unknown) => {
    if (reason instanceof AcademyError) throw reason;
    const status = typeof reason === 'object' && reason !== null && 'status' in reason
      ? Number(reason.status)
      : 400;
    throw new AcademyError(reason instanceof Error ? reason.message : 'เกิดข้อผิดพลาดในข้อมูลจำลอง', status);
  });
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/academy/${path.replace(/^\/+/, '')}`, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: { accept: 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    let message = 'ไม่สามารถเชื่อมต่อ Pharmacy Academy ได้';
    try {
      const body = await response.json() as { message?: string };
      if (body.message) message = body.message;
    } catch { /* use fallback message */ }
    throw new AcademyError(message, response.status);
  }
  return response.json() as Promise<T>;
}

export function listAcademyCategories() {
  return request<IncomingAcademyCategory[]>('categories').then((items) => items.map(mapIncomingCategory));
}

export function listAcademyInstructors() { return request<AcademyInstructor[]>('instructors'); }
export function listAcademyReviews() { return request<AcademyReview[]>('reviews'); }
export function getAcademyStats() { return request<AcademyStats>('stats'); }

export function listAcademyCourses(params: { search?: string; categoryId?: number | null; page?: number; limit?: number; featured?: boolean } = {}) {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set('q', params.search.trim());
  if (params.featured) query.set('featured', '1');
  return request<IncomingAcademyCourse[]>(`courses?${query.toString()}`)
    .then((items) => pageIncomingCourses(items, params));
}

export function getAcademyCourse(id: number) {
  return request<IncomingAcademyCourse>(`courses/${id}`).then(mapIncomingCourse);
}

export function getAcademyEnrollments() {
  return localCall(() => localRegistration.getEnrollments());
}

export async function createAcademyOrder(courseId: number): Promise<{ type: 'enrolled'; enrollment: AcademyEnrollment } | { type: 'payment_required'; order: AcademyOrder }> {
  const enrollments = await getAcademyEnrollments();
  const existing = enrollments.find((item) => item.courseId === courseId && item.status === 'active');
  if (existing) return { type: 'enrolled', enrollment: existing };
  const course = await getAcademyCourse(courseId);
  return localCall(() => localRegistration.createOrder(course));
}

export async function getAcademyOrder(orderId: number): Promise<AcademyOrder> {
  return localCall(() => localRegistration.getOrder(orderId));
}

export async function completeMockAcademyOrder(orderId: number): Promise<{ status: 'mock_paid'; enrollment: AcademyEnrollment }> {
  return localCall(() => localRegistration.completeOrder(orderId));
}
