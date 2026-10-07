"use client";

import styles from './PopularCourses.module.css';
import SectionHeader from '@/components/ui/SectionHeader';
import CourseCard from './courses/CourseCard';
import type { AcademyCourse } from '@/lib/academy/client';

export default function PopularCourses({ courses }: { courses: AcademyCourse[] }) {
    if (courses.length === 0) return null;
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <SectionHeader title="คอร์สเรียนยอดนิยม" viewAllHref="/learning/courses" viewAllText="ดูทั้งหมด" />
                <div className={styles.grid}>
                    {courses.slice(0, 9).map((course) => (
                        <CourseCard key={course.id} id={course.id} title={course.title}
                            category={course.categoryName}
                            duration={course.durationLabel || (course.durationMinutes ? `${Number((course.durationMinutes / 60).toFixed(1))} ชม.` : 'เรียนตามเวลาของคุณ')}
                            cpe={`${Number(course.cpeCredits).toLocaleString('th-TH')} หน่วยกิต`}
                            image={course.thumbnailUrl} returnTo="/learning" instructor={course.instructorName} price={course.price} />
                    ))}
                </div>
            </div>
        </section>
    );
}
