import styles from './AcademyFeedback.module.css';

export default function AcademySkeleton({ label, count = 3, variant = 'cards' }: { label: string; count?: number; variant?: 'cards' | 'detail' | 'lines' | 'categories' | 'instructors' | 'stats' }) {
    return <div role="status" aria-label={label} className={styles.loading}>
        <span className={styles.srOnly}>{label}</span>
        <div className={`${styles.skeletonGrid} ${styles[variant]}`} aria-hidden="true">
            {Array.from({ length: count }, (_, index) => <div key={index} className={styles.skeletonCard}>
                {variant !== 'lines' && <div className={styles.skeletonImage} />}
                <div className={styles.skeletonText}><div /><div /><div /></div>
            </div>)}
        </div>
    </div>;
}
