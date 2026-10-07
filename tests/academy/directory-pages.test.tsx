import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CategoriesPage from '@/app/(member)/05_learning/categories/page';
import InstructorsPage from '@/app/(member)/05_learning/instructors/page';
import ReviewsPage from '@/app/(member)/05_learning/reviews/page';
import { listAcademyCategories, listAcademyInstructors, listAcademyReviews } from '@/lib/academy/client';

vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));
vi.mock('@/lib/academy/client', () => ({
  listAcademyCategories: vi.fn(),
  listAcademyInstructors: vi.fn(),
  listAcademyReviews: vi.fn(),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe('Academy directory pages', () => {
  it.each([
    [CategoriesPage, listAcademyCategories, 'หมวดหมู่คอร์สเรียน'],
    [InstructorsPage, listAcademyInstructors, 'วิทยากรผู้เชี่ยวชาญ'],
    [ReviewsPage, listAcademyReviews, 'รีวิวจากผู้เรียน'],
  ] as const)('keeps its page title through loading and an empty response', async (Page, request, title) => {
    vi.mocked(request).mockResolvedValue([]);
    render(<Page />);
    const heading = screen.getByRole('heading', { level: 1, name: title });
    expect(await screen.findByText(/ยังไม่มี/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: title })).toBe(heading);
  });

  it('lists every visible category and links it to filtered courses', async () => {
    vi.mocked(listAcademyCategories).mockResolvedValue([
      { id: 1, name: 'เภสัชกรรมชุมชน', count: 2 },
      { id: 2, name: 'กฎหมายและจริยธรรม', count: 1 },
    ]);
    render(<CategoriesPage />);
    expect(await screen.findByRole('link', { name: /กฎหมายและจริยธรรม/ })).toHaveAttribute(
      'href', '/learning/courses?category=%E0%B8%81%E0%B8%8E%E0%B8%AB%E0%B8%A1%E0%B8%B2%E0%B8%A2%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%88%E0%B8%A3%E0%B8%B4%E0%B8%A2%E0%B8%98%E0%B8%A3%E0%B8%A3%E0%B8%A1',
    );
  });

  it('shows all instructors rather than the four shown on the Academy home', async () => {
    vi.mocked(listAcademyInstructors).mockResolvedValue(Array.from({ length: 5 }, (_, index) => ({
      id: index + 1, name: `วิทยากร ${index + 1}`, title: null, expertise: null, imageUrl: null,
    })));
    render(<InstructorsPage />);
    expect(await screen.findByText('วิทยากร 5')).toBeInTheDocument();
  });

  it('shows all reviews rather than the eight shown on the Academy home', async () => {
    vi.mocked(listAcademyReviews).mockResolvedValue(Array.from({ length: 9 }, (_, index) => ({
      id: index + 1, rating: 5, body: `รีวิวที่ ${index + 1}`, reviewerName: `ผู้เรียน ${index + 1}`,
      reviewerRole: null, courseTitle: 'คอร์สเรียน',
    })));
    render(<ReviewsPage />);
    expect(await screen.findByText(/รีวิวที่ 9/)).toBeInTheDocument();
  });
});


describe('Academy directory recovery', () => {
  it.each([
    [CategoriesPage, listAcademyCategories],
    [InstructorsPage, listAcademyInstructors],
    [ReviewsPage, listAcademyReviews],
  ] as const)('retries a failed directory request', async (Page, request) => {
    vi.mocked(request).mockRejectedValueOnce(new Error('offline')).mockResolvedValue([]);
    render(<Page />);
    fireEvent.click(await screen.findByRole('button', {name:'ลองอีกครั้ง'}));
    await screen.findByText(/ยังไม่มี/);
    expect(request).toHaveBeenCalledTimes(2);
  });
  it('keeps the category order returned by Back Office instead of sorting counts', async () => {
    vi.mocked(listAcademyCategories).mockResolvedValue([
      {id:1,name:'ลำดับแรก',count:0}, {id:2,name:'ลำดับสอง',count:10},
    ]);
    render(<CategoriesPage />);
    await screen.findByText('ลำดับแรก');
    const links=screen.getAllByRole('link').filter(link=>link.getAttribute('href')?.includes('courses?category='));
    expect(links[0]).toHaveTextContent('ลำดับแรก');
  });
});
