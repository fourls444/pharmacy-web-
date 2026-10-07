import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import CourseCard from '@/components/member/learning/courses/CourseCard';
import AcademyImage from '@/components/member/learning/AcademyImage';
import AcademySkeleton from '@/components/member/learning/AcademySkeleton';

afterEach(cleanup);

describe('Academy feedback', () => {
  it('omits absent category badges and displays provided categories', () => {
    const props = { id: 1, title: 'คอร์ส', duration: '60 นาที', cpe: '1 หน่วยกิต', image: null, returnTo: '/learning' as const };
    const view = render(<CourseCard {...props} category={null} />);
    expect(screen.queryByText('Pharmacy Academy')).not.toBeInTheDocument();
    expect(view.container.querySelector('[class*="badge"]')).not.toBeInTheDocument();
    expect(view.container.querySelector('svg')).toBeInTheDocument();
    view.rerender(<CourseCard {...props} category="หมวดหมู่จริง" />);
    expect(screen.getByText('หมวดหมู่จริง')).toBeInTheDocument();
  });

  it('names the loading state and keeps skeleton decoration out of the accessibility tree', () => {
    render(<AcademySkeleton label="กำลังโหลดคอร์ส..." count={6} />);
    const status = screen.getByRole('status', { name: 'กำลังโหลดคอร์ส...' });
    expect(status.querySelector('[aria-hidden="true"]')?.children).toHaveLength(6);
  });
});


it('replaces broken images and tries a new source when it changes', () => {
  const view=render(<AcademyImage src="/missing.jpg" alt="รูปคอร์ส" width={100} height={100} />);
  fireEvent.error(screen.getByRole('img',{name:'รูปคอร์ส'}));
  expect(screen.queryByRole('img',{name:'รูปคอร์ส'})).not.toBeInTheDocument();
  expect(view.container.querySelector('svg')).toBeInTheDocument();
  view.rerender(<AcademyImage src="/replacement.jpg" alt="รูปคอร์ส" width={100} height={100} />);
  expect(screen.getByRole('img',{name:'รูปคอร์ส'})).toBeInTheDocument();
});
