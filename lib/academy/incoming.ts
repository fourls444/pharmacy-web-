import type { AcademyCategory, AcademyCourse, AcademyPage } from './client';

export interface IncomingAcademyCategory {
  id: number;
  name: string;
  courseCount: number;
  imageUrl?: string | null;
  color?: string | null;
}

export interface IncomingAcademyCourse {
  id: number;
  title: string;
  summary?: string | null;
  coverUrl?: string | null;
  durationLabel?: string | null;
  cpeCredits?: number | string | null;
  price?: number | string | null;
  categoryId?: number | null;
  categoryName?: string | null;
  instructorName?: string | null;
  format?: string;
  venue?: string | null;
  trainingStartsAt?: string | null;
  trainingEndsAt?: string | null;
  outcomes?: string[];
  lessons?: Array<{ id: number; title: string }>;
  isFeatured?: boolean;
}

export function mapIncomingCategory(category: IncomingAcademyCategory): AcademyCategory {
  return { id: category.id, name: category.name, count: category.courseCount, imageUrl: category.imageUrl ?? null, color: category.color ?? null };
}

export function mapIncomingCourse(course: IncomingAcademyCourse): AcademyCourse {
  return {
    id: course.id,
    title: course.title,
    summary: course.summary ?? null,
    details: null,
    thumbnailUrl: course.coverUrl ?? null,
    durationMinutes: 0,
    durationLabel: course.durationLabel ?? null,
    cpeCredits: course.cpeCredits ?? '0',
    price: course.price ?? '0',
    categoryId: course.categoryId ?? null,
    categoryName: course.categoryName ?? null,
    instructorName: course.instructorName ?? null,
    format: course.format === 'onsite' || course.format === 'online' ? course.format : undefined,
    venue: course.venue ?? null,
    trainingStartsAt: course.trainingStartsAt ?? null,
    trainingEndsAt: course.trainingEndsAt ?? null,
    learningOutcomes: course.outcomes ?? [],
    curriculum: course.lessons?.map((lesson) => lesson.title) ?? [],
    isFeatured: course.isFeatured ?? false,
  };
}

export function pageIncomingCourses(
  courses: IncomingAcademyCourse[],
  params: { categoryId?: number | null; page?: number; limit?: number } = {},
): AcademyPage<AcademyCourse> {
  const filtered = params.categoryId
    ? courses.filter((course) => course.categoryId === params.categoryId)
    : courses;
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.max(1, params.limit ?? 12);
  const offset = (page - 1) * limit;
  return {
    items: filtered.slice(offset, offset + limit).map(mapIncomingCourse),
    page,
    limit,
    total: filtered.length,
  };
}
