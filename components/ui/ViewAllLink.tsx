import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import styles from './ViewAllLink.module.css';

interface ViewAllLinkProps {
    href: string;
    children?: React.ReactNode;
}

export default function ViewAllLink({ href, children = 'ดูทั้งหมด' }: ViewAllLinkProps) {
    return (
        <Link href={href} className={styles.link}>
            <span>{children}</span><ChevronRight size={16} aria-hidden="true" />
        </Link>
    );
}
