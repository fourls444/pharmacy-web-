import { describe, expect, it } from 'vitest';
import { academyCheckoutHref, academyCourseHref, academyCoursesHref, academySource } from '@/lib/academy/navigation';

describe('Academy navigation', () => {
  it('returns to the Academy home for a course opened there', () => {
    const href = academyCourseHref(1, '/learning');
    const source = academySource(new URL(href, 'https://academy.local').searchParams.get('from'));
    expect(source).toBe('/learning');
  });

  it('retains course list filters through detail and checkout', () => {
    const source = academySource('/learning/courses?search=ไต&category=เภสัชกรรมชุมชน');
    const courseHref = academyCourseHref(3, source);
    const checkoutHref = academyCheckoutHref(8001, source);
    expect(academySource(new URL(courseHref, 'https://academy.local').searchParams.get('from'))).toBe(source);
    expect(academySource(new URL(checkoutHref, 'https://academy.local').searchParams.get('from'))).toBe(source);
  });

  it('falls back to Academy home for an untrusted return URL', () => {
    expect(academySource('https://example.com/learning/courses')).toBe('/learning');
    expect(academySource('//example.com/learning/courses')).toBe('/learning');
  });

  it('keeps list filters in the history URL', () => {
    const url = new URL(academyCoursesHref('ไต', 'เภสัชกรรมชุมชน'), 'https://academy.local');
    expect(url.pathname).toBe('/learning/courses');
    expect(url.searchParams.get('search')).toBe('ไต');
    expect(url.searchParams.get('category')).toBe('เภสัชกรรมชุมชน');
    expect(academyCoursesHref('', 'ทั้งหมด')).toBe('/learning/courses');
  });
});
