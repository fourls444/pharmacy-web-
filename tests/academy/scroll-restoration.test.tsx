import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScrollToTopOnNavigate from '@/components/ui/ScrollToTopOnNavigate';
import { readAcademyPosition, restoreAcademyPosition, saveAcademyPosition } from '@/lib/academy/scroll-restoration';

const route = vi.hoisted(() => ({ pathname: '/learning' }));
vi.mock('next/navigation', () => ({ usePathname: () => route.pathname }));

describe('Academy return scroll position', () => {
  beforeEach(() => {
    sessionStorage.clear();
    route.pathname = '/learning';
    history.replaceState({}, '', '/learning');
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 4000 });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { callback(0); return 1; });
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

  it('keeps the saved position while sections grow and releases restoration when the user scrolls', () => {
    let resize: (() => void) | undefined;
    let connected = false;
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) { resize = () => { if (connected) callback(); }; }
      observe() { connected = true; }
      disconnect() { connected = false; }
    });
    const stop = restoreAcademyPosition(1000);
    vi.mocked(window.scrollTo).mockClear();
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 5000 });
    resize?.();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1000, left: 0, behavior: 'instant' });
    expect(document.documentElement.style.overflowAnchor).toBe('none');
    vi.mocked(window.scrollTo).mockClear();
    window.dispatchEvent(new Event('scroll'));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1000, left: 0, behavior: 'instant' });
    window.dispatchEvent(new Event('wheel'));
    vi.mocked(window.scrollTo).mockClear();
    resize?.();
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(document.documentElement.style.overflowAnchor).toBe('');
    stop();
  });

  it('preserves other saved pages when recording a position after reload', () => {
    sessionStorage.setItem('academy-scroll-positions', JSON.stringify({ '/learning/courses?category=ใหม่': 780 }));
    saveAcademyPosition('/learning/5', 300);
    expect(readAcademyPosition('/learning/courses?category=ใหม่')).toBe(780);
  });

  it('waits for the fetched list to grow before restoring the full position', () => {
    let resize: (() => void) | undefined;
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) { resize = callback; }
      observe() {}
      disconnect() {}
    });
    const page = render(<ScrollToTopOnNavigate />);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1200 });
    act(() => { window.dispatchEvent(new Event('scroll')); });
    history.pushState({}, '', '/learning/1');
    route.pathname = '/learning/1';
    page.rerender(<ScrollToTopOnNavigate />);
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 600 });
    history.replaceState({}, '', '/learning');
    act(() => { window.dispatchEvent(new PopStateEvent('popstate')); });
    route.pathname = '/learning';
    page.rerender(<ScrollToTopOnNavigate />);
    vi.mocked(window.scrollTo).mockClear();
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 4000 });
    act(() => { resize?.(); });
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1200, left: 0, behavior: 'instant' });
    vi.unstubAllGlobals();
  });

  it('restores the last position after returning from a course', () => {
    const page = render(<ScrollToTopOnNavigate />);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 920 });
    act(() => { window.dispatchEvent(new Event('scroll')); });
    history.pushState({}, '', '/learning/1');
    route.pathname = '/learning/1';
    page.rerender(<ScrollToTopOnNavigate />);
    vi.mocked(window.scrollTo).mockClear();

    history.replaceState({}, '', '/learning');
    act(() => { window.dispatchEvent(new PopStateEvent('popstate')); });
    route.pathname = '/learning';
    page.rerender(<ScrollToTopOnNavigate />);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 920, left: 0, behavior: 'instant' });
    expect(window.scrollTo).not.toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('records the visible URL when Next resolves the internal learning rewrite', () => {
    route.pathname = '/05_learning';
    render(<ScrollToTopOnNavigate />);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 1100 });
    act(() => { window.dispatchEvent(new Event('scroll')); });
    expect(readAcademyPosition('/learning')).toBe(1100);
  });

  it('captures the click position before navigation while the route hook is catching up', () => {
    render(<ScrollToTopOnNavigate />);
    history.replaceState({}, '', '/learning/courses');
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 780 });
    act(() => { document.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    expect(readAcademyPosition('/learning/courses')).toBe(780);
  });

  it('keeps positions separate for different course list filters', () => {
    history.replaceState({}, '', '/learning/courses?search=ไต');
    route.pathname = '/learning/courses';
    const page = render(<ScrollToTopOnNavigate />);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 640 });
    act(() => { window.dispatchEvent(new Event('scroll')); });
    history.replaceState({}, '', '/learning/courses?search=ยา');
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 240 });
    act(() => { window.dispatchEvent(new Event('scroll')); });
    history.pushState({}, '', '/learning/2');
    route.pathname = '/learning/2';
    page.rerender(<ScrollToTopOnNavigate />);
    vi.mocked(window.scrollTo).mockClear();
    history.replaceState({}, '', '/learning/courses?search=ไต');
    act(() => { window.dispatchEvent(new PopStateEvent('popstate')); });
    route.pathname = '/learning/courses';
    page.rerender(<ScrollToTopOnNavigate />);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 640, left: 0, behavior: 'instant' });
  });

  it('continues scrolling new pages outside Academy to the top', () => {
    route.pathname = '/news';
    history.replaceState({}, '', '/news');
    render(<ScrollToTopOnNavigate />);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });
});
