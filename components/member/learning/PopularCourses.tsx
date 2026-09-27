"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Award } from 'lucide-react';
import styles from './PopularCourses.module.css';
import SectionHeader from '@/components/ui/SectionHeader';
import { academyCourseHref } from '@/lib/academy/navigation';
import type { AcademyCourse } from '@/lib/academy/client';

const getCategoryColor = (category: string) => {
    switch (category) {
        case 'เภสัชกรรมชุมชน': return '#4e73df';
        case 'เภสัชกรรมโรงพยาบาล': return '#1cc88a';
        case 'เภสัชบำบัด': return '#1b7f91';
        case 'เภสัชกรรมสมุนไพร': return '#5b8c40';
        case 'การบริหารเภสัชกิจ': return '#6b63b5';
        case 'การผลิตและควบคุม': return '#f6c23e';
        case 'กฎหมายและจริยธรรม': return '#e74a3b';
        case 'เภสัชวิเคราะห์': return '#36b9cc';
        case 'การคุ้มครองผู้บริโภค': return '#f6c23e';
        case 'เภสัชศาสตร์นวัตกรรม': return '#4e73df';
        case 'การบริหารงานคลัง': return '#1cc88a';
        default: return '#737300';
    }
};

export default function PopularCourses({ courses }: { courses: AcademyCourse[] }) {
    if (courses.length === 0) return null;
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <SectionHeader
                    title="คอร์สเรียนยอดนิยม"
                    viewAllHref="/learning/courses"
                    viewAllText="ดูทั้งหมด"
                />

                <div className={styles.grid}>
                    {courses.slice(0, 9).map((course) => (
                        <Link href={academyCourseHref(course.id, '/learning')} key={course.id} className={styles.card}>
                            <div className={styles.imageWrapper}>
                                <Image
                                    src={course.thumbnailUrl || '/images/public/learning/categories/cat1.png'}
                                    alt={course.title}
                                    fill
                                    className={styles.image}
                                />
                                <div
                                    className={styles.badge}
                                    style={{ backgroundColor: getCategoryColor(course.categoryName || '') }}
                                >
                                    {course.categoryName || 'Pharmacy Academy'}
                                </div>
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.title}>{course.title}</h3>
                                <div className={styles.meta}>
                                    <div className={styles.metaItem}>
                                        <Clock size={16} />
                                        <span>{Number((course.durationMinutes / 60).toFixed(1))} ชม.</span>
                                    </div>
                                    <div className={styles.metaItem}>
                                        <Award size={16} />
                                        <span>{Number(course.cpeCredits).toLocaleString('th-TH')} หน่วยกิต</span>
                                    </div>
                                </div>
                                <div className={styles.footer}>
                                    <div className={styles.enrollBtn}>
                                        <span>เข้าสู่บทเรียน</span>
                                        <ArrowRight size={16} className={styles.arrow} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
