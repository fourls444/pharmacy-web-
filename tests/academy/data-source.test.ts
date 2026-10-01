import { afterEach, describe, expect, it, vi } from 'vitest';

describe('Academy data source', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('keeps the mock course catalog without an Academy-specific environment setting', async () => {
    vi.stubEnv('NEXT_PUBLIC_ACADEMY_DATA_SOURCE', 'api');
    vi.resetModules();
    const fetchRequest = vi.fn();
    vi.stubGlobal('fetch', fetchRequest);

    const { listAcademyCourses } = await import('@/lib/academy/client');
    const page = await listAcademyCourses({ limit: 1 });

    expect(page.items).toHaveLength(1);
    expect(page.total).toBeGreaterThan(0);
    expect(fetchRequest).not.toHaveBeenCalled();
  });
});
