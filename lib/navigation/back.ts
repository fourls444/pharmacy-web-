type BackRouter = {
  back: () => void;
  push: (href: string) => void;
};

type BackEntry = { path: string; depth: number };

type BackState = { __pharmacyBack?: BackEntry };

function readBackEntry(state: unknown): BackEntry | null {
  if (!state || typeof state !== 'object' || !('__pharmacyBack' in state)) return null;
  const entry = (state as BackState).__pharmacyBack;
  return entry && typeof entry.path === 'string' && Number.isInteger(entry.depth) && entry.depth >= 0
    ? entry
    : null;
}

export function nextBackEntry(state: unknown, path: string, previous: BackEntry | null): BackEntry {
  const existing = readBackEntry(state);
  if (existing?.path === path) return existing;
  return { path, depth: previous && previous.path !== path ? previous.depth + 1 : 0 };
}

export function goBack(
  router: BackRouter,
  fallbackHref: string,
  historyState: unknown = window.history.state,
  historyLength = window.history.length,
) {
  const entry = readBackEntry(historyState);
  if (entry && entry.depth > 0 && historyLength > 1) {
    router.back();
    return;
  }

  router.push(fallbackHref);
}
