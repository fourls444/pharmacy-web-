import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import LearningPage from '@/app/(member)/05_learning/page';
import { getAcademyStats, listAcademyCategories, listAcademyCourses, listAcademyInstructors, listAcademyReviews } from '@/lib/academy/client';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/lib/academy/client', () => ({
  AcademyError: class extends Error {}, getAcademyStats: vi.fn(), listAcademyCategories: vi.fn(),
  listAcademyCourses: vi.fn(), listAcademyInstructors: vi.fn(), listAcademyReviews: vi.fn(),
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('Academy home section loading', () => {
  it('keeps successful courses visible when categories fail and retries only the failed section', async () => {
    vi.mocked(listAcademyCategories).mockRejectedValueOnce(new Error('offline')).mockResolvedValue([{ id: 1, name: 'หมวดหมู่ใหม่', count: 1 }]);
    const course = { id: 1, title: 'คอร์สที่โหลดสำเร็จ', summary: null, instructorName: null,
      thumbnailUrl: null, durationMinutes: 60, cpeCredits: 1, price: 0, categoryId: null, categoryName: null };
    vi.mocked(listAcademyCourses).mockResolvedValue({ items: [course], total: 1, page: 1, limit: 9 });
    vi.mocked(listAcademyInstructors).mockResolvedValue([]);
    vi.mocked(listAcademyReviews).mockResolvedValue([]);
    vi.mocked(getAcademyStats).mockResolvedValue({ courseCount: 1, learnerCount: 2, instructorCount: 0 });
    render(<LearningPage />);
    expect(screen.queryAllByText(/ยังไม่มี/)).toHaveLength(0);
    expect(screen.getAllByRole('status')).toHaveLength(6);
    expect(screen.getByRole('status', { name: 'กำลังโหลดคอร์สยอดนิยม...' }).querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    await screen.findByText('คอร์สที่โหลดสำเร็จ');
    expect(await screen.findByRole('alert')).toHaveTextContent('โหลดหมวดหมู่ไม่สำเร็จ');
    const calls = vi.mocked(listAcademyCourses).mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: /ลองอีกครั้ง/ }));
    await screen.findByRole('link', { name: /หมวดหมู่ใหม่/ });
    expect(listAcademyCourses).toHaveBeenCalledTimes(calls);
    expect(screen.getByText('คอร์สที่โหลดสำเร็จ')).toBeInTheDocument();
  });
});
