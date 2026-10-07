import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  const values = new Map<string, string>();
  Object.defineProperty(window, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
    clear: () => { values.clear(); },
  } });
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('Academy data source', () => {
  it('loads the published catalog from the shared API', async () => {
    const fetchRequest = vi.fn().mockResolvedValue(Response.json([{
      id: 87, title: 'คอร์สจริง', coverUrl: '/cover.jpg', categoryId: 4, price: '350',
    }]));
    vi.stubGlobal('fetch', fetchRequest);

    const { listAcademyCourses } = await import('@/lib/academy/client');
    const page = await listAcademyCourses({ categoryId: 4, limit: 1 });

    expect(fetchRequest).toHaveBeenCalledOnce();
    expect(String(fetchRequest.mock.calls[0][0])).toContain('/api/academy/courses');
    expect(page.items[0]).toMatchObject({ id: 87, title: 'คอร์สจริง', thumbnailUrl: '/cover.jpg' });
    expect(page.total).toBe(1);
  });

  it('keeps paid registration local and never posts a paid order to the API', async () => {
    const fetchRequest = vi.fn().mockResolvedValue(Response.json({
      id: 87, title: 'คอร์สจริง', categoryId: 4, price: '350',
    }));
    vi.stubGlobal('fetch', fetchRequest);

    const { createAcademyOrder, completeMockAcademyOrder, getAcademyEnrollments } = await import('@/lib/academy/client');
    const result = await createAcademyOrder(87);
    expect(result.type).toBe('payment_required');
    if (result.type !== 'payment_required') return;

    await completeMockAcademyOrder(result.order.id);
    expect(await getAcademyEnrollments()).toMatchObject([{ courseId: 87, status: 'active' }]);
    expect(fetchRequest).toHaveBeenCalledOnce();
    expect(fetchRequest.mock.calls[0][1]?.method).toBeUndefined();
  });

  it('keeps free registration local too', async () => {
    const fetchRequest = vi.fn().mockResolvedValue(Response.json({
      id: 91, title: 'คอร์สฟรี', categoryId: 4, price: '0',
    }));
    vi.stubGlobal('fetch', fetchRequest);

    const { createAcademyOrder, getAcademyEnrollments } = await import('@/lib/academy/client');
    const result = await createAcademyOrder(91);
    expect(result.type).toBe('enrolled');
    expect(await getAcademyEnrollments()).toMatchObject([{ courseId: 91, status: 'active' }]);
    expect(fetchRequest).toHaveBeenCalledOnce();
  });
});
