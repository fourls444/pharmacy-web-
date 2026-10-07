"use client";

import AcademySkeleton from '@/components/member/learning/AcademySkeleton';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LearningBanner from '@/components/member/learning/LearningBanner';
import CourseFilters from '@/components/member/learning/courses/CourseFilters';
import PopularCategories from '@/components/member/learning/PopularCategories';
import FeaturedCourse from '@/components/member/learning/FeaturedCourse';
import PopularCourses from '@/components/member/learning/PopularCourses';
import ExperiencedInstructors from '@/components/member/learning/ExperiencedInstructors';
import LearningStats from '@/components/member/learning/LearningStats';
import LearnerReviews from '@/components/member/learning/LearnerReviews';
import SectionHeader from '@/components/ui/SectionHeader';
import { AcademyError, getAcademyStats, listAcademyCategories, listAcademyCourses, listAcademyInstructors, listAcademyReviews } from '@/lib/academy/client';
import styles from './learning.module.css';

const loadPopularCourses = () => listAcademyCourses({ limit: 9 }).then((page) => page.items);
const loadFeaturedCourses = () => listAcademyCourses({ featured: true, limit: 2 }).then((page) => page.items.filter((course) => course.isFeatured));

type SectionStatus = 'loading' | 'ready' | 'error';

function useAcademySection<T>(load: () => Promise<T>, initialData: T, fallbackError: string) {
    const [data, setData] = useState(initialData);
    const [status, setStatus] = useState<SectionStatus>('loading');
    const [error, setError] = useState('');
    const [version, setVersion] = useState(0);

    useEffect(() => {
        let active = true;
        load().then((result) => {
            if (active) { setData(result); setStatus('ready'); }
        }).catch((reason: unknown) => {
            if (active) { setError(reason instanceof AcademyError ? reason.message : fallbackError); setStatus('error'); }
        });
        return () => { active = false; };
    }, [load, fallbackError, version]);

    const retry = () => {
        setStatus('loading');
        setError('');
        setVersion((current) => current + 1);
    };
    return { data, status, error, retry };
}

function SectionState({ title, href, loadingText, emptyText, section }: {
    title: string;
    href?: string;
    loadingText: string;
    emptyText: string;
    section: { status: SectionStatus; error: string; retry: () => void };
}) {
    return <section className={styles.sectionState} aria-label={title}>
        <div className={styles.container}>
            <SectionHeader title={title} viewAllHref={href} />
            <div className={styles.sectionMessage} role={section.status === 'loading' ? undefined : section.status === 'error' ? 'alert' : 'status'}>
                {section.status === 'loading' ? <AcademySkeleton count={title.includes('วิทยากร') || title.includes('หมวดหมู่') ? 4 : title.includes('แนะนำ') ? 2 : 3} label={loadingText} variant={title === 'สถิติการเรียนรู้' ? 'stats' : title.includes('หมวดหมู่') ? 'categories' : title.includes('วิทยากร') ? 'instructors' : title.includes('รีวิว') ? 'lines' : title.includes('แนะนำ') ? 'detail' : 'cards'} /> : <p>{section.status === 'error' ? section.error : emptyText}</p>}
                {section.status === 'error' && <button type="button" className={styles.retryButton}
                    aria-label={`ลองอีกครั้ง: ${title}`} onClick={section.retry}>ลองอีกครั้ง</button>}
            </div>
        </div>
    </section>;
}

export default function LearningPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
    const categories = useAcademySection(listAcademyCategories, [], 'โหลดหมวดหมู่ไม่สำเร็จ');
    const courses = useAcademySection(loadPopularCourses, [], 'โหลดคอร์สยอดนิยมไม่สำเร็จ');
    const featured = useAcademySection(loadFeaturedCourses, [], 'โหลดคอร์สแนะนำไม่สำเร็จ');
    const instructors = useAcademySection(listAcademyInstructors, [], 'โหลดวิทยากรไม่สำเร็จ');
    const reviews = useAcademySection(listAcademyReviews, [], 'โหลดรีวิวไม่สำเร็จ');
    const stats = useAcademySection(getAcademyStats, null, 'โหลดสถิติไม่สำเร็จ');

    const openCourses = () => {
        const query = new URLSearchParams();
        if (searchTerm.trim()) query.set('search', searchTerm.trim());
        if (selectedCategory !== 'ทั้งหมด') query.set('category', selectedCategory);
        router.push(`/learning/courses${query.size ? `?${query}` : ''}`);
    };

    return <div className={styles.page}>
        <LearningBanner />
        <div className={`${styles.container} ${styles.search}`}>
            <CourseFilters categories={['ทั้งหมด', ...categories.data.map((item) => item.name)]}
                selectedCategory={selectedCategory} searchTerm={searchTerm}
                onCategoryChange={setSelectedCategory} onSearchChange={setSearchTerm} onSearch={openCourses} />
        </div>
        {categories.status === 'ready' && categories.data.length > 0 ? <PopularCategories categories={categories.data} /> :
            <SectionState title="หมวดหมู่คอร์สเรียน" href="/learning/categories" loadingText="กำลังโหลดหมวดหมู่..." emptyText="ยังไม่มีหมวดหมู่คอร์สเรียน" section={categories} />}
        {featured.status === 'ready' && featured.data.length > 0 ? <FeaturedCourse courses={featured.data} /> :
            <SectionState title="คอร์สเรียนแนะนำ" href="/learning/courses" loadingText="กำลังโหลดคอร์สแนะนำ..." emptyText="ยังไม่มีคอร์สแนะนำ" section={featured} />}
        {instructors.status === 'ready' && instructors.data.length > 0 ? <ExperiencedInstructors instructors={instructors.data} /> :
            <SectionState title="วิทยากรผู้เชี่ยวชาญ" href="/learning/instructors" loadingText="กำลังโหลดวิทยากร..." emptyText="ยังไม่มีข้อมูลวิทยากร" section={instructors} />}
        {stats.status === 'ready' && stats.data ? <LearningStats data={stats.data} /> :
            <SectionState title="สถิติการเรียนรู้" loadingText="กำลังโหลดสถิติ..." emptyText="ยังไม่มีข้อมูลสถิติ" section={stats} />}
        {courses.status === 'ready' && courses.data.length > 0 ? <PopularCourses courses={courses.data} /> :
            <SectionState title="คอร์สเรียนยอดนิยม" href="/learning/courses" loadingText="กำลังโหลดคอร์สยอดนิยม..." emptyText="ยังไม่มีคอร์สที่เผยแพร่" section={courses} />}
        {reviews.status === 'ready' && reviews.data.length > 0 ? <LearnerReviews reviews={reviews.data} /> :
            <SectionState title="รีวิวจากผู้เรียน" href="/learning/reviews" loadingText="กำลังโหลดรีวิว..." emptyText="ยังไม่มีรีวิวจากผู้เรียน" section={reviews} />}
    </div>;
}
