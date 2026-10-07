'use client';

import AcademySkeleton from '@/components/member/learning/AcademySkeleton';

import { useEffect, useState } from 'react';
import AcademyBackLink from '@/components/member/learning/AcademyBackLink';
import LearnerReviews from '@/components/member/learning/LearnerReviews';
import { AcademyReview, listAcademyReviews } from '@/lib/academy/client';
import styles from '../directory.module.css';

export default function ReviewsPage() {
    const [reloadKey, setReloadKey] = useState(0);
    const [items, setItems] = useState<AcademyReview[]>([]);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    useEffect(() => {
        let active = true;
        listAcademyReviews().then((data) => { if (active) { setItems(data); setStatus('ready'); } })
            .catch(() => { if (active) setStatus('error'); });
        return () => { active = false; };
    }, [reloadKey]);
    return <main className={styles.page}>
        <div className={styles.back}><AcademyBackLink href="/learning" destination="Pharmacy Academy" /></div>
        <div className={styles.heading}><h1>รีวิวจากผู้เรียน</h1></div>
        {status === 'ready' && items.length > 0 ? <LearnerReviews reviews={items} showAll /> :
            <div className={styles.message}>{status === 'loading' ? <AcademySkeleton variant="lines" label="กำลังโหลดรีวิว..." /> : <p role="status">{status === 'error' ? 'โหลดรีวิวไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' : 'ยังไม่มีรีวิวจากผู้เรียน'}</p>}{status === 'error' && <button className={styles.retryButton} type="button" onClick={() => { setStatus('loading'); setReloadKey(value => value + 1); }}>ลองอีกครั้ง</button>}</div>}
    </main>;
}
