"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import styles from './courses.module.css';
import LearningBanner from '@/components/member/learning/LearningBanner';
import AcademyBackLink from '@/components/member/learning/AcademyBackLink';
import { academyCoursesHref } from '@/lib/academy/navigation';
import { AcademyCategory, AcademyCourse, AcademyError, listAcademyCategories, listAcademyCourses } from '@/lib/academy/client';
import CourseCard from '@/components/member/learning/courses/CourseCard';
import CourseFilters from '@/components/member/learning/courses/CourseFilters';

const ALL = 'ทั้งหมด';

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

function durationLabel(minutes: number) {
    if (!minutes) return 'เรียนตามเวลาของคุณ';
    return `${Number((minutes / 60).toFixed(1))} ชม.`;
}

function CoursesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') ?? '');
    const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') ?? ALL);
    const [categories, setCategories] = useState<AcademyCategory[]>([]);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);
    const [courses, setCourses] = useState<AcademyCourse[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        listAcademyCategories().then((items) => {
            if (!cancelled) { setCategories(items); setCategoriesLoaded(true); }
        }).catch((reason: unknown) => {
            if (!cancelled) { setError(reason instanceof AcademyError ? reason.message : 'โหลดหมวดหมู่ไม่สำเร็จ'); setCategoriesLoaded(true); }
        });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!categoriesLoaded) return;
        let cancelled = false;
        const timer = setTimeout(() => {
            setLoading(true);
            const categoryId = categories.find((item) => item.name === selectedCategory)?.id;
            if (selectedCategory !== ALL && !categoryId) {
                setCourses([]);
                setTotal(0);
                setLoading(false);
                return;
            }
            listAcademyCourses({ search: searchTerm, categoryId, limit: 100 })
                .then((page) => {
                    if (cancelled) return;
                    setCourses(page.items);
                    setTotal(page.total);
                    setError('');
                })
                .catch((reason: unknown) => {
                    if (!cancelled) setError(reason instanceof AcademyError ? reason.message : 'โหลดคอร์สไม่สำเร็จ');
                })
                .finally(() => { if (!cancelled) setLoading(false); });
        }, 200);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [searchTerm, selectedCategory, categories, categoriesLoaded]);

    const returnTo = academyCoursesHref(searchTerm, selectedCategory);
    const updateFilters = (search: string, category: string) => {
        setSearchTerm(search);
        setSelectedCategory(category);
        router.replace(academyCoursesHref(search, category), { scroll: false });
    };
    const loadMore = async () => {
        setLoadingMore(true);
        try {
            const categoryId = categories.find((item) => item.name === selectedCategory)?.id;
            const next = await listAcademyCourses({
                search: searchTerm,
                categoryId,
                page: Math.floor(courses.length / 100) + 1,
                limit: 100,
            });
            setCourses((current) => [...current, ...next.items]);
            setTotal(next.total);
        } catch (reason) {
            setError(reason instanceof AcademyError ? reason.message : 'โหลดคอร์สเพิ่มเติมไม่สำเร็จ');
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <div className={styles.page}>
            <LearningBanner />
            <div className={`${styles.container} ${styles.backRow}`}><AcademyBackLink href="/learning" destination="Pharmacy Academy" /></div>
            <section className={styles.searchSection}>
                <div className={styles.container}>
                    <CourseFilters
                        categories={[ALL, ...categories.map((item) => item.name)]}
                        selectedCategory={selectedCategory}
                        searchTerm={searchTerm}
                        onCategoryChange={(category) => updateFilters(searchTerm, category)}
                        onSearchChange={(search) => updateFilters(search, selectedCategory)}
                    />
                </div>
            </section>
            <section className={styles.coursesSection}>
                <div className={styles.container}>
                    <div className={styles.resultsBar}>
                        <div className={styles.resultsCount}>พบทั้งหมด <span>{total}</span> รายการ</div>
                    </div>
                    {error ? <div className={styles.emptyState} role="alert">{error}</div> : loading ? (
                        <div className={styles.emptyState}>กำลังโหลดคอร์ส...</div>
                    ) : courses.length > 0 ? (
                        <div className={styles.grid}>
                            {courses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    id={course.id}
                                    title={course.title}
                                    category={course.categoryName || 'Pharmacy Academy'}
                                    duration={durationLabel(course.durationMinutes)}
                                    cpe={`${Number(course.cpeCredits).toLocaleString('th-TH')} หน่วยกิต`}
                                    image={course.thumbnailUrl || '/images/public/learning/categories/cat1.png'}
                                    returnTo={returnTo}
                                    getCategoryColor={getCategoryColor}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}><Search size={30} strokeWidth={1.8} aria-hidden="true" /></span>
                            <h3 className={styles.emptyTitle}>ไม่พบคอร์สที่ตรงกับเงื่อนไข</h3>
                            <p className={styles.emptySubtitle}>
                                {searchTerm.trim()
                                    ? `ไม่พบคอร์สสำหรับ “${searchTerm.trim()}”${selectedCategory !== ALL ? ` ในหมวด${selectedCategory}` : ''}`
                                    : selectedCategory !== ALL ? `ยังไม่มีคอร์สในหมวด${selectedCategory}` : 'ยังไม่มีคอร์สที่เผยแพร่'}
                                <br />ลองใช้คำอื่นหรือล้างตัวกรองเพื่อดูคอร์สทั้งหมด
                            </p>
                            <button type="button" className={styles.resetButton} onClick={() => updateFilters('', ALL)}>ล้างตัวกรอง</button>
                        </div>
                    )}
                    {!loading && !error && courses.length < total && (
                        <button type="button" className={styles.resetButton} onClick={loadMore} disabled={loadingMore}>
                            {loadingMore ? 'กำลังโหลด...' : 'ดูคอร์สเพิ่มเติม'}
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
}

export default function CoursesPage() {
    return <Suspense fallback={<div>กำลังโหลด...</div>}><CoursesContent /></Suspense>;
}
