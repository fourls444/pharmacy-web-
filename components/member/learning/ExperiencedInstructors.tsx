"use client";

import AcademyImagePlaceholder from './AcademyImagePlaceholder';
import React from 'react';
import AcademyImage from './AcademyImage';
import styles from './ExperiencedInstructors.module.css';
import SectionHeader from '@/components/ui/SectionHeader';
import type { AcademyInstructor } from '@/lib/academy/client';

export default function ExperiencedInstructors({ instructors, showAll = false }: { instructors: AcademyInstructor[]; showAll?: boolean }) {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                {!showAll && <SectionHeader
                    title="วิทยากรผู้เชี่ยวชาญ"
                    viewAllHref={showAll ? undefined : '/learning/instructors'}
                    viewAllText="ดูทั้งหมด"
                />}

                <p className={styles.subtitle}>เรียนรู้จากประสบการณ์จริงของเภสัชกรและคณาจารย์ผู้ทรงคุณวุฒิในสายวิชาชีพ</p>
                {instructors.length === 0 && <p className={styles.empty}>ยังไม่มีข้อมูลวิทยากร</p>}

                <div className={styles.grid}>
                    {instructors.slice(0, showAll ? undefined : 4).map((instructor) => (
                        <div key={instructor.id} className={styles.card}>
                            <div className={styles.imageWrapper}>
                                {instructor.imageUrl ? <AcademyImage src={instructor.imageUrl} alt={instructor.name} fill sizes="140px" className={styles.image} /> : <AcademyImagePlaceholder />}
                            </div>
                            <div className={styles.info}>
                                <h3 className={styles.name}>{instructor.name}</h3>
                                <p className={styles.title}>{instructor.title}</p>
                                <span className={styles.expertise}>{instructor.expertise}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
