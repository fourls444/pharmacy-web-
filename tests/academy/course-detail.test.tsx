import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import CourseDetailPage from '@/app/(member)/05_learning/[id]/page';
import { getAcademyCourse, getAcademyEnrollments, listAcademyReviews } from '@/lib/academy/client';

const { route } = vi.hoisted(() => ({ route: { id: '1' } }));
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: route.id }),
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));
vi.mock('@/lib/academy/client', () => ({
  AcademyError: class extends Error {}, getAcademyCourse: vi.fn(), getAcademyEnrollments: vi.fn(),
  listAcademyReviews: vi.fn(), createAcademyOrder: vi.fn(),
}));

const course = (id: number) => ({ id, title: `คอร์ส ${id}`, summary: 'รายละเอียด', instructorName: 'ผู้สอน',
  thumbnailUrl: null, durationMinutes: 60, cpeCredits: 1, price: 0, categoryId: null, categoryName: null });
afterEach(() => { cleanup(); vi.clearAllMocks(); route.id = '1'; });

describe('Academy course details', () => {
  it('shows a skeleton during loading and omits absent category and format tags', async () => {
    let resolveCourse!: (value: ReturnType<typeof course>) => void;
    vi.mocked(getAcademyCourse).mockReturnValue(new Promise((resolve) => { resolveCourse = resolve; }));
    vi.mocked(getAcademyEnrollments).mockResolvedValue([]);
    vi.mocked(listAcademyReviews).mockResolvedValue([]);
    render(<CourseDetailPage />);
    const status = screen.getByRole('status', { name: 'กำลังโหลดรายละเอียดคอร์ส...' });
    expect(status.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    resolveCourse(course(1));
    await screen.findByRole('heading', { level: 1, name: 'คอร์ส 1' });
    expect(screen.queryByText('Pharmacy Academy')).not.toBeInTheDocument();
    expect(screen.queryByText('คอร์สออนไลน์')).not.toBeInTheDocument();
    expect(screen.queryByText('รูปแบบ')).not.toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'กำลังโหลดรายละเอียดคอร์ส...' })).not.toBeInTheDocument();
  });

  it('scrolls to lessons without adding hash history that would trap the back link', async () => {
    vi.mocked(getAcademyEnrollments).mockResolvedValue([]);
    vi.mocked(getAcademyCourse).mockResolvedValue(course(1));
    vi.mocked(listAcademyReviews).mockResolvedValue([]);
    render(<CourseDetailPage />);
    await screen.findByRole('heading', { level: 1, name: 'คอร์ส 1' });
    const lessons = screen.getByRole('heading', { name: 'บทเรียนในคอร์ส' }).closest('section')!;
    const scrollIntoView = vi.fn();
    lessons.scrollIntoView = scrollIntoView;
    const historyLength = window.history.length;
    const hash = window.location.hash;
    fireEvent.click(screen.getByRole('link', { name: 'บทเรียน' }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(window.history.length).toBe(historyLength);
    expect(window.location.hash).toBe(hash);
  });

  it('keeps the back link after a load failure and retries details and reviews separately', async () => {
    vi.mocked(getAcademyEnrollments).mockResolvedValue([]);
    vi.mocked(getAcademyCourse).mockRejectedValueOnce(new Error('offline')).mockResolvedValue(course(1));
    vi.mocked(listAcademyReviews).mockRejectedValueOnce(new Error('offline')).mockResolvedValue([]);
    render(<CourseDetailPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('โหลดรายละเอียดคอร์สไม่สำเร็จ');
    expect(screen.getByRole('link', { name: 'ย้อนกลับ' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    await screen.findByRole('heading', { level: 1, name: 'คอร์ส 1' });
    fireEvent.click(await screen.findByRole('button', { name: 'โหลดรีวิวอีกครั้ง' }));
    await screen.findByText('ยังไม่มีรีวิวสำหรับคอร์สนี้');
    expect(getAcademyCourse).toHaveBeenCalledTimes(2);
    expect(listAcademyReviews).toHaveBeenCalledTimes(2);
  });

  it('replaces previous course content when the route changes', async () => {
    vi.mocked(getAcademyEnrollments).mockResolvedValue([]);
    vi.mocked(getAcademyCourse).mockImplementation(async (id) => course(id));
    vi.mocked(listAcademyReviews).mockResolvedValue([]);
    const view = render(<CourseDetailPage />);
    await screen.findByRole('heading', { level: 1, name: 'คอร์ส 1' });
    route.id = '2';
    view.rerender(<CourseDetailPage />);
    await screen.findByRole('heading', { level: 1, name: 'คอร์ส 2' });
    expect(screen.queryByRole('heading', { level: 1, name: 'คอร์ส 1' })).not.toBeInTheDocument();
    await waitFor(() => expect(getAcademyCourse).toHaveBeenLastCalledWith(2));
  });
});


describe('Academy course audit fixes', () => {
  it('matches reviews by course ID even when course titles are identical', async () => {
    vi.mocked(getAcademyEnrollments).mockResolvedValue([]);
    vi.mocked(getAcademyCourse).mockResolvedValue(course(1));
    vi.mocked(listAcademyReviews).mockResolvedValue([
      {id:1,courseId:1,courseTitle:'คอร์ส 1',rating:5,body:'รีวิวคอร์สที่เลือก',reviewerName:'A',reviewerRole:null},
      {id:2,courseId:2,courseTitle:'คอร์ส 1',rating:5,body:'รีวิวคอร์สอื่นชื่อซ้ำ',reviewerName:'B',reviewerRole:null},
    ]);
    render(<CourseDetailPage />);
    await screen.findByText('รีวิวคอร์สที่เลือก');
    expect(screen.queryByText('รีวิวคอร์สอื่นชื่อซ้ำ')).not.toBeInTheDocument();
  });
  it('shows onsite start and end dates in Bangkok time', async () => {
    vi.mocked(getAcademyEnrollments).mockResolvedValue([]);
    vi.mocked(listAcademyReviews).mockResolvedValue([]);
    vi.mocked(getAcademyCourse).mockResolvedValue({...course(1),format:'onsite',trainingStartsAt:'2026-10-07T02:00:00Z',trainingEndsAt:'2026-10-07T09:00:00Z'});
    render(<CourseDetailPage />);
    await screen.findByText('เริ่มอบรม');
    expect(screen.getByText('สิ้นสุดอบรม')).toBeInTheDocument();
    expect(screen.getByText(/09:00 น./)).toBeInTheDocument();
    expect(screen.getByText(/16:00 น./)).toBeInTheDocument();
  });
});


it('shows a retry state rather than claiming no reviews when the old API omits course IDs', async () => {
  vi.mocked(getAcademyEnrollments).mockResolvedValue([]);
  vi.mocked(getAcademyCourse).mockResolvedValue(course(1));
  vi.mocked(listAcademyReviews).mockResolvedValue([{id:1,courseTitle:'คอร์ส 1',rating:5,body:'รีวิวเก่า',reviewerName:'A',reviewerRole:null}]);
  render(<CourseDetailPage />);
  await screen.findByRole('button',{name:'โหลดรีวิวอีกครั้ง'});
  expect(screen.queryByText('ยังไม่มีรีวิวสำหรับคอร์สนี้')).not.toBeInTheDocument();
});
