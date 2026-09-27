import { mockAcademy, runMock } from './mock';

const USE_MOCK_ACADEMY = process.env.NEXT_PUBLIC_ACADEMY_DATA_SOURCE !== 'api';

export interface AcademyCategory {
  id: number;
  name: string;
  count: number;
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
  cpeCredits: number | string;
  price: number | string;
  maxStudents?: number | null;
  enrollmentDeadline?: string | null;
  categoryId: number | null;
  categoryName: string | null;
  status?: 'draft' | 'published' | 'archived';
  createdAt?: string;
}

export interface AcademyPage<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface AcademyEnrollment {
  courseId: number;
  enrollmentId: number;
  status: 'active' | 'cancelled';
  enrolledAt: string;
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

function mockCall<T>(operation: () => T): Promise<T> {
  return runMock(operation).catch((reason: unknown) => {
    if (reason instanceof AcademyError) throw reason;
    const status = typeof reason === 'object' && reason !== null && 'status' in reason
      ? Number(reason.status)
      : 400;
    throw new AcademyError(reason instanceof Error ? reason.message : 'เกิดข้อผิดพลาดในข้อมูลตัวอย่าง', status);
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
  if (USE_MOCK_ACADEMY) return mockCall(() => mockAcademy.listCategories());
  return request<AcademyCategory[]>('categories');
}

export function listAcademyCourses(params: { search?: string; categoryId?: number | null; page?: number; limit?: number } = {}) {
  if (USE_MOCK_ACADEMY) return mockCall(() => mockAcademy.listCourses(params));
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.categoryId) query.set('categoryId', String(params.categoryId));
  query.set('page', String(params.page ?? 1));
  query.set('limit', String(params.limit ?? 12));
  return request<AcademyPage<AcademyCourse>>(`courses?${query.toString()}`);
}

export function getAcademyCourse(id: number) {
  if (USE_MOCK_ACADEMY) return mockCall(() => mockAcademy.getCourse(id));
  return request<AcademyCourse>(`courses/${id}`);
}

export function getAcademyEnrollments() {
  if (USE_MOCK_ACADEMY) return mockCall(() => mockAcademy.getEnrollments());
  return request<AcademyEnrollment[]>('me/enrollments');
}

export function createAcademyOrder(courseId: number) {
  if (USE_MOCK_ACADEMY) return mockCall(() => mockAcademy.createOrder(courseId));
  return request<{ type: 'enrolled'; enrollment: AcademyEnrollment } | { type: 'payment_required'; order: AcademyOrder }>(
    `courses/${courseId}/orders`,
    { method: 'POST' },
  );
}

export function getAcademyOrder(orderId: number) {
  if (USE_MOCK_ACADEMY) return mockCall(() => mockAcademy.getOrder(orderId));
  return request<AcademyOrder>(`orders/${orderId}`);
}

export function completeMockAcademyOrder(orderId: number) {
  if (USE_MOCK_ACADEMY) return mockCall(() => mockAcademy.completeOrder(orderId));
  return request<{ status: 'mock_paid'; enrollment: AcademyEnrollment }>(`orders/${orderId}/mock-complete`, {
    method: 'POST',
  });
}
