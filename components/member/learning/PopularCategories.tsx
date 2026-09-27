"use client";

import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import type { CSSProperties } from 'react';
import styles from './PopularCategories.module.css';
import SectionHeader from '@/components/ui/SectionHeader';
import type { AcademyCategory } from '@/lib/academy/client';

const colors = ['#4e73df', '#1cc88a', '#f6c23e', '#e74a3b', '#36b9cc'];

export default function PopularCategories({ categories }: { categories: AcademyCategory[] }) {
    if (categories.length === 0) return null;
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <SectionHeader title="หมวดหมู่คอร์สเรียน" viewAllHref="/learning/courses" viewAllText="ดูทั้งหมด" />

                <div className={styles.grid}>
                    {[...categories].sort((a, b) => b.count - a.count).slice(0, 8).map((cat, index) => (
                        <Link 
                            key={cat.id} 
                            href={`/learning/courses?category=${encodeURIComponent(cat.name)}`}
                            className={styles.card} 
                            style={{ '--hover-color': colors[index % colors.length] } as CSSProperties}
                        >
                            <div className={styles.imageWrapper}>
                                <div className={styles.imageInner}>
                                    <BookOpen size={27} strokeWidth={1.8} aria-hidden="true" />
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
