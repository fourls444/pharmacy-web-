"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import styles from './FeaturedCourse.module.css';
import SectionHeader from '@/components/ui/SectionHeader';
import { academyCourseHref } from '@/lib/academy/navigation';
import type { AcademyCourse } from '@/lib/academy/client';

export default function FeaturedCourse({ courses }: { courses: AcademyCourse[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const featured = courses.slice(0, 2);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? featured.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev === featured.length - 1 ? 0 : prev + 1));
    };

    if (featured.length === 0) return null;
    const course = featured[currentIndex] || featured[0];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <SectionHeader 
                    title="คอร์สเรียนแนะนำ" 
                    viewAllHref="/learning/courses" 
                    viewAllText="ดูทั้งหมด"
                />

                <div className={styles.cardWrapper}>
                    <div className={styles.card}>
                        {/* Navigation Buttons inside Card */}
                        {featured.length > 1 && <button onClick={handlePrev} className={`${styles.navBtn} ${styles.prevBtn}`} aria-label="คอร์สก่อนหน้า">
                            <ChevronLeft size={24} />
                        </button>}
                        {featured.length > 1 && <button onClick={handleNext} className={`${styles.navBtn} ${styles.nextBtn}`} aria-label="คอร์สถัดไป">
                            <ChevronRight size={24} />
                        </button>}
                        <div className={styles.imageSide}>
                            <Image 
                                src={course.thumbnailUrl || '/images/public/learning/categories/cat1.png'}
                                alt={course.title} 
                                fill 
                                className={styles.image} 
                                priority
                            />
                        </div>
                        
                        <div className={styles.contentSide}>
                            <div className={styles.topInfo}>
                                <h2 className={styles.title}>{course.title}</h2>
                                <p className={styles.description}>{course.summary}</p>
                            </div>

                            {course.learningOutcomes && course.learningOutcomes.length > 0 && <div className={styles.outcomesSection}>
                                <h4 className={styles.subTitle}>สิ่งที่จะได้เรียนรู้</h4>
                                <ul className={styles.outcomesList}>
                                    {course.learningOutcomes.map((item, idx) => (
                                        <li key={idx} className={styles.outcomeItem}>
                                            <Check size={16} className={styles.checkIcon} />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>}

                            <Link href={academyCourseHref(course.id, '/learning')} className={styles.enrollBtn}>เข้าสู่บทเรียน</Link>

                            <div className={styles.footer}>
                                <div className={styles.footerItem}>
                                    <span className={styles.footerLabel}>ผู้สอน</span>
                                    <span className={styles.footerValue}>{course.instructorName || 'ไม่ระบุ'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
