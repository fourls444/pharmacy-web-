import styles from "./UIContent.module.css";
import ViewAllLink from './ViewAllLink';

interface SectionHeaderProps {
    title: string;
    viewAllHref?: string;
    viewAllText?: string;
    children?: React.ReactNode;
}

export default function SectionHeader({ title, viewAllHref, viewAllText = "ดูทั้งหมด", children }: SectionHeaderProps) {
    return (
        <div className={styles.sectionHeader}>
            <h2 className={styles.title}>{title}</h2>
            {viewAllHref && (
                <ViewAllLink href={viewAllHref}>{viewAllText}</ViewAllLink>
            )}
            {children}
        </div>
    );
}
