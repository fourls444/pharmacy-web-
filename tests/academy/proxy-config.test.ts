// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const configuredUrl = process.env.NEXT_PUBLIC_API_URL;

afterEach(() => {
  if (configuredUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
  else process.env.NEXT_PUBLIC_API_URL = configuredUrl;
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe('Academy API proxy configuration', () => {
  it('uses the existing shared API endpoint when no environment file is present', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    vi.resetModules();
    const upstream = vi.fn().mockResolvedValue(Response.json([]));
    vi.stubGlobal('fetch', upstream);

    const { GET } = await import('@/app/api/academy/[...path]/route');
    const request = {
      method: 'GET',
      headers: new Headers(),
      nextUrl: new URL('http://localhost:3000/api/academy/categories'),
    } as NextRequest;
    const response = await GET(request, { params: Promise.resolve({ path: ['categories'] }) });

    expect(response.status).toBe(200);
    expect(String(upstream.mock.calls[0][0])).toBe('https://pharmacy-api-6w5d.onrender.com/academy/categories');
  });
});
