export type AcademySource = '/learning' | `/learning/courses${string}`;

export function academyCoursesHref(searchTerm: string, category: string): AcademySource {
  const query = new URLSearchParams();
  if (searchTerm.trim()) query.set('search', searchTerm.trim());
  if (category && category !== 'ทั้งหมด') query.set('category', category);
  return `/learning/courses${query.size ? `?${query}` : ''}`;
}

export function academySource(value: string | null): AcademySource {
  if (!value) return '/learning';
  try {
    const url = new URL(value, 'https://academy.local');
    if (url.origin !== 'https://academy.local') return '/learning';
    if (url.pathname === '/learning') return '/learning';
    if (url.pathname !== '/learning/courses') return '/learning';

    const query = new URLSearchParams();
    const search = url.searchParams.get('search')?.trim();
    const category = url.searchParams.get('category')?.trim();
    if (search) query.set('search', search);
    if (category) query.set('category', category);
    return `/learning/courses${query.size ? `?${query}` : ''}`;
  } catch {
    return '/learning';
  }
}

export function academyCourseHref(courseId: number, source: AcademySource): string {
  const query = new URLSearchParams({ from: source });
  return `/learning/${courseId}?${query}`;
}

export function academyCheckoutHref(orderId: number, source: AcademySource): string {
  const query = new URLSearchParams({ orderId: String(orderId), from: source });
  return `/learning/checkout?${query}`;
}
