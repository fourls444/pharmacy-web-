import { describe, expect, it } from 'vitest';
import { mapIncomingCategory, mapIncomingCourse, pageIncomingCourses } from '@/lib/academy/incoming';

const course = {
  id: 7,
  title: 'คอร์สตัวอย่าง',
  summary: 'เนื้อหาย่อ',
  coverUrl: '/course.jpg',
  durationLabel: '2 ชั่วโมง',
  cpeCredits: '2.50',
  price: '490.00',
  categoryId: 3,
  categoryName: 'เภสัชกรรมชุมชน',
  instructorName: 'ภญ. ตัวอย่าง',
  format: 'online',
  outcomes: ['ใช้ยาอย่างปลอดภัย'],
  lessons: [{ id: 1, title: 'บทนำ' }],
};

describe('Incoming Academy contract', () => {
  it('does not invent a course type when the source has no known format', () => {
    expect(mapIncomingCourse({ id: 1, title: 'ไม่มีประเภท' }).format).toBeUndefined();
    expect(mapIncomingCourse({ id: 2, title: 'ประเภทอื่น', format: 'unknown' }).format).toBeUndefined();
    expect(mapIncomingCourse({ ...course, format: 'onsite' }).format).toBe('onsite');
  });
  it('maps course and category fields into the current front-office view', () => {
    expect(mapIncomingCategory({ id: 3, name: 'เภสัชกรรมชุมชน', courseCount: 4 })).toMatchObject({
      id: 3, name: 'เภสัชกรรมชุมชน', count: 4,
    });
    expect(mapIncomingCourse(course)).toMatchObject({
      id: 7,
      thumbnailUrl: '/course.jpg',
      durationLabel: '2 ชั่วโมง',
      price: '490.00',
      learningOutcomes: ['ใช้ยาอย่างปลอดภัย'],
      curriculum: ['บทนำ'],
    });
  });

  it('keeps category filtering and pagination when the API returns an array', () => {
    const page = pageIncomingCourses([course, { ...course, id: 8, categoryId: 4 }], {
      categoryId: 3, page: 1, limit: 1,
    });
    expect(page.total).toBe(1);
    expect(page.items.map((item) => item.id)).toEqual([7]);
  });
});
