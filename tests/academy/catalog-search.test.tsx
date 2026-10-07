import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import CoursesPage from '@/app/(member)/05_learning/courses/page';
import { listAcademyCategories, listAcademyCourses } from '@/lib/academy/client';

const { replace, location } = vi.hoisted(() => ({ replace: vi.fn(), location: { query: '' } }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, back: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(location.query),
}));
vi.mock('@/lib/academy/client', () => ({
  AcademyError: class extends Error {},
  listAcademyCategories: vi.fn(),
  listAcademyCourses: vi.fn(),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); location.query = ''; });

describe('Academy catalog search', () => {
  it('submits the current query from the button and Enter and resets empty results', async () => {
    vi.mocked(listAcademyCategories).mockResolvedValue([]);
    vi.mocked(listAcademyCourses).mockResolvedValue({ items: [], total: 0, page: 1, limit: 100 });
    render(<CoursesPage />);
    await screen.findByText('ยังไม่มีคอร์สที่เผยแพร่', { exact: false });
    const input = screen.getByRole('textbox', { name: 'ค้นหาคอร์ส' });
    const initialCalls = vi.mocked(listAcademyCourses).mock.calls.length;

    fireEvent.change(input, { target: { value: '  diabetes  ' } });
    expect(listAcademyCourses).toHaveBeenCalledTimes(initialCalls);
    fireEvent.click(screen.getByRole('button', { name: 'ค้นหา' }));
    await waitFor(() => expect(listAcademyCourses).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'diabetes' })));
    expect(replace).toHaveBeenLastCalledWith('/learning/courses?search=diabetes', { scroll: false });
    await screen.findByText(/ไม่พบคอร์สสำหรับ “diabetes”/);

    fireEvent.change(input, { target: { value: 'hypertension' } });
    fireEvent.submit(input.closest('form')!);
    await waitFor(() => expect(listAcademyCourses).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'hypertension' })));
    await screen.findByText(/ไม่พบคอร์สสำหรับ “hypertension”/);
    fireEvent.click(screen.getByRole('button', { name: 'ล้างตัวกรอง' }));
    await waitFor(() => expect(listAcademyCourses).toHaveBeenLastCalledWith(expect.objectContaining({ search: '', categoryId: undefined })));
    expect(input).toHaveValue('');
    expect(replace).toHaveBeenLastCalledWith('/learning/courses', { scroll: false });
  });

  it('keeps a failed request visible and retries the submitted query', async () => {
    vi.mocked(listAcademyCategories).mockResolvedValue([]);
    vi.mocked(listAcademyCourses).mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ items: [], total: 0, page: 1, limit: 100 });
    render(<CoursesPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('โหลดคอร์สไม่สำเร็จ');
    fireEvent.click(screen.getByRole('button', { name: 'ลองอีกครั้ง' }));
    await screen.findByText('ยังไม่มีคอร์สที่เผยแพร่', { exact: false });
    expect(listAcademyCourses).toHaveBeenCalledTimes(2);
  });

  it('restores the query when browser history changes on the catalog route', async () => {
    vi.mocked(listAcademyCategories).mockResolvedValue([]);
    vi.mocked(listAcademyCourses).mockResolvedValue({ items: [], total: 0, page: 1, limit: 100 });
    const view = render(<CoursesPage />);
    await screen.findByText('ยังไม่มีคอร์สที่เผยแพร่', { exact: false });
    location.query = 'search=diabetes';
    view.rerender(<CoursesPage />);
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'ค้นหาคอร์ส' })).toHaveValue('diabetes'));
    await waitFor(() => expect(listAcademyCourses).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'diabetes' })));
  });

  it('discards a pending page from the previous filter', async () => {
    const course = (id: number, title: string) => ({ id, title, summary: null, instructorName: null,
      thumbnailUrl: null, durationMinutes: 60, cpeCredits: 1, price: 0, categoryId: null, categoryName: null });
    vi.mocked(listAcademyCategories).mockResolvedValue([{ id: 1, name: 'กฎหมาย', count: 1 }]);
    let completePage!: (page: Awaited<ReturnType<typeof listAcademyCourses>>) => void;
    vi.mocked(listAcademyCourses)
      .mockResolvedValueOnce({ items: Array.from({ length: 100 }, (_, index) => course(index + 1, `คอร์ส ${index + 1}`)), total: 101, page: 1, limit: 100 })
      .mockImplementationOnce(() => new Promise((resolve) => { completePage = resolve; }))
      .mockResolvedValue({ items: [course(200, 'คอร์สกฎหมาย')], total: 1, page: 1, limit: 100 });
    render(<CoursesPage />);
    fireEvent.click(await screen.findByRole('button', { name: 'ดูคอร์สเพิ่มเติม' }));
    fireEvent.change(screen.getByRole('combobox', { name: 'เลือกหมวดหมู่คอร์ส' }), { target: { value: 'กฎหมาย' } });
    await screen.findByText('คอร์สกฎหมาย');
    await act(async () => { completePage({ items: [course(101, 'ผลลัพธ์จากตัวกรองเดิม')], total: 101, page: 2, limit: 100 }); });
    expect(screen.queryByText('ผลลัพธ์จากตัวกรองเดิม')).not.toBeInTheDocument();
  });
});


it('keeps loaded courses after a load-more failure and retries the same page', async () => {
  const course=(id:number)=>({id,title:`คอร์ส ${id}`,summary:null,instructorName:null,thumbnailUrl:null,durationMinutes:60,cpeCredits:1,price:0,categoryId:null,categoryName:null});
  vi.mocked(listAcademyCategories).mockResolvedValue([]);
  vi.mocked(listAcademyCourses)
    .mockResolvedValueOnce({items:Array.from({length:100},(_,i)=>course(i+1)),total:101,page:1,limit:100})
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValueOnce({items:[course(101)],total:101,page:2,limit:100});
  render(<CoursesPage />);
  fireEvent.click(await screen.findByRole('button',{name:'ดูคอร์สเพิ่มเติม'}));
  await screen.findByRole('alert');
  expect(screen.getByText('คอร์ส 1')).toBeInTheDocument();
  expect(screen.getByText('คอร์ส 100')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'ลองโหลดเพิ่มเติมอีกครั้ง'}));
  await screen.findByText('คอร์ส 101');
  expect(listAcademyCourses).toHaveBeenLastCalledWith(expect.objectContaining({page:2}));
}, 15000);
