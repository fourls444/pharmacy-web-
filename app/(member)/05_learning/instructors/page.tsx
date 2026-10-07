'use client';

import AcademySkeleton from '@/components/member/learning/AcademySkeleton';

import { useEffect, useState } from 'react';
import AcademyBackLink from '@/components/member/learning/AcademyBackLink';
import ExperiencedInstructors from '@/components/member/learning/ExperiencedInstructors';
import { AcademyInstructor, listAcademyInstructors } from '@/lib/academy/client';
import styles from '../directory.module.css';

export default function InstructorsPage() {
    const [reloadKey, setReloadKey] = useState(0);
    const [items, setItems] = useState<AcademyInstructor[]>([]);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    useEffect(() => {
        let active = true;
        listAcademyInstructors().then((data) => { if (active) { setItems(data); setStatus('ready'); } })
            .catch(() => { if (active) setStatus('error'); });
        return () => { active = false; };
    }, [reloadKey]);
    return <main className={styles.page}>
        <div className={styles.back}><AcademyBackLink href="/learning" destination="Pharmacy Academy" /></div>
        <div className={styles.heading}><h1>วิทยากรผู้เชี่ยวชาญ</h1></div>
        {status === 'ready' && items.length > 0 ? <ExperiencedInstructors instructors={items} showAll /> :
            <div className={styles.message}>{status === 'loading' ? <AcademySkeleton variant="instructors" label="กำลังโหลดวิทยากร..." /> : <p role="status">{status === 'error' ? 'โหลดวิทยากรไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' : 'ยังไม่มีข้อมูลวิทยากร'}</p>}{status === 'error' && <button className={styles.retryButton} type="button" onClick={() => { setStatus('loading'); setReloadKey(value => value + 1); }}>ลองอีกครั้ง</button>}</div>}
    </main>;
}
