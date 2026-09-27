import { NextResponse, type NextRequest } from 'next/server';
import { signPharmacyAssertion } from '@/lib/server/conference-assertion';
import { PHARMACY_SESSION_COOKIE, readPharmacySession } from '@/lib/server/pharmacy-auth/session';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
const ACADEMY_AUDIENCE = 'pharmacy-academy-api';

function isAllowed(method: string, path: string[]) {
  const joined = path.join('/');
  if (method === 'GET' && ['categories', 'courses'].includes(joined)) return { authenticated: false };
  if (method === 'GET' && /^courses\/\d+$/.test(joined)) return { authenticated: false };
  if (method === 'GET' && joined === 'me/enrollments') return { authenticated: true };
  if (method === 'GET' && /^orders\/\d+$/.test(joined)) return { authenticated: true };
  if (method === 'POST' && /^courses\/\d+\/orders$/.test(joined)) return { authenticated: true };
  if (method === 'POST' && /^orders\/\d+\/mock-complete$/.test(joined)) return { authenticated: true };
  return null;
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const rule = isAllowed(request.method, path);
  if (!rule || path.some((part) => part === '..' || part.includes('\\'))) {
    return Response.json({ message: 'ไม่พบข้อมูลที่ต้องการ' }, { status: 404 });
  }
  if (!API_URL) return Response.json({ message: 'ยังไม่ได้ตั้งค่า Academy API' }, { status: 503 });

  const headers = new Headers({ accept: 'application/json' });
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const idempotencyKey = request.headers.get('idempotency-key');
  if (idempotencyKey) headers.set('idempotency-key', idempotencyKey);

  if (rule.authenticated) {
    const session = readPharmacySession(request);
    if (session.status !== 'valid') {
      const response = NextResponse.json({ message: 'กรุณาเข้าสู่ระบบใหม่' }, { status: 401 });
      if (session.status === 'stale') response.cookies.delete(PHARMACY_SESSION_COOKIE);
      return response;
    }
    headers.set('authorization', `Bearer ${await signPharmacyAssertion(session.identity, ACADEMY_AUDIENCE)}`);
  }

  const target = new URL(`${API_URL}/academy/${path.join('/')}`);
  target.search = request.nextUrl.search;
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
    });
    const responseHeaders = new Headers();
    const responseType = upstream.headers.get('content-type');
    if (responseType) responseHeaders.set('content-type', responseType);
    responseHeaders.set('cache-control', 'no-store');
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ message: 'เชื่อมต่อ Academy API ไม่สำเร็จ' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
