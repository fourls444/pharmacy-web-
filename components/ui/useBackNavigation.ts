'use client';

import { useRouter } from 'next/navigation';
import { goBack } from '@/lib/navigation/back';

export function useBackNavigation(fallbackHref: string) {
  const router = useRouter();
  return () => goBack(router, fallbackHref);
}
