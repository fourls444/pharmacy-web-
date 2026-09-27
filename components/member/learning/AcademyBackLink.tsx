import { ArrowLeft } from 'lucide-react';
import BackLink from '@/components/ui/BackLink';
import styles from './AcademyBackLink.module.css';

interface AcademyBackLinkProps {
    href: string;
    destination: string;
}

export default function AcademyBackLink({ href, destination }: AcademyBackLinkProps) {
    return (
        <BackLink className={styles.link} href={href} title={`กลับไปหน้า${destination === 'Pharmacy Academy' ? ' ' : ''}${destination}`}>
            <span className={styles.icon}><ArrowLeft size={18} aria-hidden="true" /></span>
            <span>ย้อนกลับ</span>
        </BackLink>
    );
}
