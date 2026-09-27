'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { nextBackEntry } from '@/lib/navigation/back';

export default function BackNavigationTracker() {
  const path = usePathname();
  const previous = useRef<{ path: string; depth: number } | null>(null);

  useEffect(() => {
    const state = window.history.state;
    const entry = nextBackEntry(state, path, previous.current);
    if (!state?.__pharmacyBack || state.__pharmacyBack.path !== path || state.__pharmacyBack.depth !== entry.depth) {
      window.history.replaceState({ ...state, __pharmacyBack: entry }, '');
    }
    previous.current = entry;
  }, [path]);

  return null;
}
