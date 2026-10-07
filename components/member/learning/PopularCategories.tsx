"use client";

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import AcademyImage from './AcademyImage';
import styles from './PopularCategories.module.css';
import SectionHeader from '@/components/ui/SectionHeader';
import type { AcademyCategory } from '@/lib/academy/client';


export default function PopularCategories({ categories, showAll = false }: { categories: AcademyCategory[]; showAll?: boolean }) {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                {!showAll && <SectionHeader title="หมวดหมู่คอร์สเรียน" viewAllHref="/learning/categories" viewAllText="ดูทั้งหมด" />}
                {categories.length === 0 && <p className={styles.empty}>ยังไม่มีหมวดหมู่คอร์สเรียน</p>}

                <div className={styles.grid}>
                    {categories.slice(0, showAll ? undefined : 8).map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/learning/courses?category=${encodeURIComponent(cat.name)}`}
                            className={styles.card}
                        >
                            <div className={styles.imageWrapper}>
                                <div className={styles.imageInner}>
                                    {cat.imageUrl ? <AcademyImage src={cat.imageUrl} alt="" width={42} height={42} style={{ objectFit: 'contain' }} /> : <BookOpen size={27} strokeWidth={1.8} aria-hidden="true" />}
                                </div>
                            </div>
                            <h3 className={styles.catTitle}>{cat.name}</h3>
                            <p className={styles.catCount}>{cat.count} คอร์สเรียน</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
