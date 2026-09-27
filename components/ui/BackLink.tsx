'use client';

import type { MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { goBack } from '@/lib/navigation/back';

type BackLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  title?: string;
};

export default function BackLink({ href, children, className, title }: BackLinkProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    goBack(router, href);
  };

  return <Link href={href} className={className} title={title} onClick={handleClick}>{children}</Link>;
}
