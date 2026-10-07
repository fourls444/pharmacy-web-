const STORAGE_KEY = 'academy-scroll-positions';
const positions = new Map<string, number>();

export function isAcademyPath(path: string) {
  return path === '/learning' || path.startsWith('/learning/') || path === '/05_learning' || path.startsWith('/05_learning/');
}

export function currentAcademyUrl() {
  return window.location.pathname + window.location.search;
}

export function saveAcademyPosition(url: string, top: number) {
  if (!isAcademyPath(url.split('?')[0]) || !Number.isFinite(top)) return;
  try {
    const saved: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}');
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
      positions.clear();
      for (const [path, position] of Object.entries(saved)) {
        if (isAcademyPath(path.split('?')[0]) && typeof position === 'number' && Number.isFinite(position)) {
          positions.set(path, Math.max(0, position));
        }
      }
    }
  } catch { /* Retain the in-memory fallback when storage is unavailable. */ }
  positions.delete(url);
  positions.set(url, Math.max(0, top));
  // Keep this tab's recent pages only, including when storage is unavailable.
  while (positions.size > 50) positions.delete(positions.keys().next().value!);
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(positions))); } catch { /* Browser storage may be disabled. */ }
}

export function readAcademyPosition(url: string): number {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')[url];
    return typeof saved === 'number' && Number.isFinite(saved) ? Math.max(0, saved) : 0;
  } catch { return positions.get(url) ?? 0; }
}

/** Preserve the return position while fetched sections change the page height. */
export function restoreAcademyPosition(top: number): () => void {
  let stopped = false;
  let frame = 0;
  let observer: ResizeObserver | undefined;
  const previousAnchor = document.documentElement.style.overflowAnchor;
  document.documentElement.style.overflowAnchor = 'none';
  const stop = () => {
    if (stopped) return;
    stopped = true;
    document.documentElement.style.overflowAnchor = previousAnchor;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    clearTimeout(timeout);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchstart', stop);
    window.removeEventListener('pointerdown', stop);
    window.removeEventListener('keydown', stop);
    window.removeEventListener('scroll', schedule);
  };
  const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(attempt); };
  const attempt = () => {
    if (stopped) return;
    const height = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    const available = Math.max(0, height - window.innerHeight);
    window.scrollTo({ top: Math.min(top, available), left: 0, behavior: 'instant' });
  };
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchstart', stop, { passive: true });
  window.addEventListener('pointerdown', stop);
  window.addEventListener('keydown', stop);
  window.addEventListener('scroll', schedule, { passive: true });
  const timeout = setTimeout(stop, 10000);
  if (typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => { frame = requestAnimationFrame(attempt); });
    observer.observe(document.body);
  }
  frame = requestAnimationFrame(attempt);
  return stop;
}
