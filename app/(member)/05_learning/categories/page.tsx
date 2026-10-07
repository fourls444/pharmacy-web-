'use client';

import AcademySkeleton from '@/components/member/learning/AcademySkeleton';

import { useEffect, useState } from 'react';
import AcademyBackLink from '@/components/member/learning/AcademyBackLink';
import PopularCategories from '@/components/member/learning/PopularCategories';
import { AcademyCategory, listAcademyCategories } from '@/lib/academy/client';
import styles from '../directory.module.css';

export default function CategoriesPage() {
    const [reloadKey, setReloadKey] = useState(0);
    const [items, setItems] = useState<AcademyCategory[]>([]);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    useEffect(() => {
        let active = true;
        listAcademyCategories().then((data) => { if (active) { setItems(data); setStatus('ready'); } })
            .catch(() => { if (active) setStatus('error'); });
        return () => { active = false; };
    }, [reloadKey]);
    return <main className={styles.page}>
        <div className={styles.back}><AcademyBackLink href="/learning" destination="Pharmacy Academy" /></div>
        <div className={styles.heading}><h1>หมวดหมู่คอร์สเรียน</h1></div>
        {status === 'ready' && items.length > 0 ? <PopularCategories categories={items} showAll /> :
            <div className={styles.message}>{status === 'loading' ? <AcademySkeleton variant="categories" label="กำลังโหลดหมวดหมู่..." /> : <p role="status">{status === 'error' ? 'โหลดหมวดหมู่ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' : 'ยังไม่มีหมวดหมู่คอร์สเรียน'}</p>}{status === 'error' && <button className={styles.retryButton} type="button" onClick={() => { setStatus('loading'); setReloadKey(value => value + 1); }}>ลองอีกครั้ง</button>}</div>}
    </main>;
}
