import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AcademyBackLink from '@/components/member/learning/AcademyBackLink';

vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));

describe('AcademyBackLink', () => {
  it('uses the shared short back label while preserving the destination', () => {
    render(<AcademyBackLink href="/learning/courses?search=ไต" destination="คอร์สทั้งหมด" />);

    const link = screen.getByRole('link', { name: 'ย้อนกลับ' });
    expect(link).toHaveAttribute('href', '/learning/courses?search=ไต');
    expect(link).toHaveAttribute('title', 'กลับไปหน้าคอร์สทั้งหมด');
  });
});
