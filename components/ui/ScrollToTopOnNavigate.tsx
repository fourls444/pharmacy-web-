"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { currentAcademyUrl, isAcademyPath, readAcademyPosition, restoreAcademyPosition, saveAcademyPosition } from '@/lib/academy/scroll-restoration';

/** Scroll to top when the route changes (nav tab / page switch). */
export default function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const activePath = useRef(pathname);
  const returnUrl = useRef<string | null>(null);
  const restoring = useRef(false);
  const stopRestoring = useRef<(() => void) | null>(null);

  useEffect(() => {
    const save = () => {
      if (!restoring.current && window.location.pathname === activePath.current) {
        saveAcademyPosition(currentAcademyUrl(), window.scrollY);
      }
    };
    // Capture before links navigate, even if a rewrite has not updated usePathname yet.
    const saveBeforeNavigation = () => {
      if (!restoring.current) saveAcademyPosition(currentAcademyUrl(), window.scrollY);
    };
    const restore = () => {
      stopRestoring.current?.();
      const target = readAcademyPosition(currentAcademyUrl());
      restoring.current = true;
      stopRestoring.current = restoreAcademyPosition(target);
    };
    const onPop = () => {
      returnUrl.current = currentAcademyUrl();
      if (isAcademyPath(window.location.pathname) && window.location.pathname === activePath.current) restore();
    };
    const resumeSaving = () => { restoring.current = false; };
    window.addEventListener('scroll', save, { passive: true });
    window.addEventListener('pagehide', save);
    document.addEventListener('click', saveBeforeNavigation, true);
    window.addEventListener('popstate', onPop);
    window.addEventListener('wheel', resumeSaving, { passive: true });
    window.addEventListener('touchstart', resumeSaving, { passive: true });
    window.addEventListener('pointerdown', resumeSaving);
    window.addEventListener('keydown', resumeSaving);
    return () => {
      stopRestoring.current?.();
      window.removeEventListener('scroll', save);
      window.removeEventListener('pagehide', save);
      document.removeEventListener('click', saveBeforeNavigation, true);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('wheel', resumeSaving);
      window.removeEventListener('touchstart', resumeSaving);
      window.removeEventListener('pointerdown', resumeSaving);
      window.removeEventListener('keydown', resumeSaving);
    };
  }, []);

  useEffect(() => {
    // Rewrites can expose /05_learning to Next while the address bar uses /learning.
    activePath.current = window.location.pathname;
    stopRestoring.current?.();
    if (isAcademyPath(pathname) && returnUrl.current === currentAcademyUrl()) {
      returnUrl.current = null;
      restoring.current = true;
      stopRestoring.current = restoreAcademyPosition(readAcademyPosition(currentAcademyUrl()));
      return;
    }
    returnUrl.current = null;
    restoring.current = false;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
