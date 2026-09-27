import { describe, expect, it, vi } from 'vitest';
import { goBack, nextBackEntry } from '@/lib/navigation/back';

describe('back navigation', () => {
  it('returns to the most recent history entry when one exists', () => {
    const router = { back: vi.fn(), push: vi.fn() };

    goBack(router, '/learning', { __pharmacyBack: { path: '/learning/3', depth: 1 } }, 2);

    expect(router.back).toHaveBeenCalledOnce();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('uses the fallback for a directly opened page', () => {
    const router = { back: vi.fn(), push: vi.fn() };

    goBack(router, '/learning', { __pharmacyBack: { path: '/learning/3', depth: 0 } }, 2);

    expect(router.back).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith('/learning');
  });

  it('tracks app pages but does not count a direct entry as a previous app page', () => {
    const entry = nextBackEntry({}, '/learning/3', null);
    expect(entry.depth).toBe(0);

    const next = nextBackEntry(entry, '/learning/checkout', { path: '/learning/3', depth: 0 });
    expect(next.depth).toBe(1);

    const restored = nextBackEntry({ __pharmacyBack: entry }, '/learning/3', { path: '/learning/checkout', depth: 1 });
    expect(restored.depth).toBe(0);
  });
});
