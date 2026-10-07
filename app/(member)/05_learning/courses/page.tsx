"use client";

import AcademySkeleton from '@/components/member/learning/AcademySkeleton';

import { Suspense, useEffect, useRef, useState } from 'react';
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

function durationLabel(minutes: number) {
    if (!minutes) return 'เรียนตามเวลาของคุณ';
    return `${Number((minutes / 60).toFixed(1))} ชม.`;
}

function CoursesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('search') ?? '';
    const categoryQuery = searchParams.get('category') ?? ALL;
    const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') ?? '');
    const [searchDraft, setSearchDraft] = useState(() => searchParams.get('search') ?? '');
    const [requestVersion, setRequestVersion] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') ?? ALL);
    const [categories, setCategories] = useState<AcademyCategory[]>([]);
    const [categoriesLoaded, setCategoriesLoaded] = useState(false);
    const [categoryError, setCategoryError] = useState('');
    const [categoryRequest, setCategoryRequest] = useState(0);
    const [courses, setCourses] = useState<AcademyCourse[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [moreError, setMoreError] = useState('');
    const [error, setError] = useState('');
    const generation = useRef(0);
    const pendingReload = useRef(true);
    const pendingMore = useRef(false);
    const activeFilters = useRef({ search: searchQuery, category: categoryQuery });

    useEffect(() => {
        if (activeFilters.current.search === searchQuery && activeFilters.current.category === categoryQuery) return;
        activeFilters.current = { search: searchQuery, category: categoryQuery };
        generation.current += 1;
        pendingReload.current = true;
        pendingMore.current = false;
        setLoadingMore(false);
        setLoading(true);
        setError('');
        setMoreError('');
        setSearchTerm(searchQuery);
        setSearchDraft(searchQuery);
        setSelectedCategory(categoryQuery);
    }, [searchQuery, categoryQuery]);

    useEffect(() => {
        let cancelled = false;
        listAcademyCategories().then((items) => {
            if (!cancelled) { setCategories(items); setCategoriesLoaded(true); }
        }).catch((reason: unknown) => {
            if (!cancelled) { setCategoryError(reason instanceof AcademyError ? reason.message : 'โหลดหมวดหมู่ไม่สำเร็จ'); setCategoriesLoaded(true); }
        });
        return () => { cancelled = true; };
    }, [categoryRequest]);

    useEffect(() => {
        if (!categoriesLoaded) return;
        const requestGeneration = ++generation.current;
        pendingReload.current = true;
        let cancelled = false;
        const timer = setTimeout(() => {
            setLoading(true);
            const categoryId = categories.find((item) => item.name === selectedCategory)?.id;
            if (selectedCategory !== ALL && !categoryId) {
                setCourses([]);
                setTotal(0);
                setLoading(false);
                pendingReload.current = false;
                return;
            }
            listAcademyCourses({ search: searchTerm, categoryId, limit: 100 })
                .then((page) => {
                    if (cancelled || generation.current !== requestGeneration) return;
                    setCourses(page.items);
                    setTotal(page.total);
                    setError('');
        setMoreError('');
                })
                .catch((reason: unknown) => {
                    if (!cancelled && generation.current === requestGeneration) setError(reason instanceof AcademyError ? reason.message : 'โหลดคอร์สไม่สำเร็จ');
                })
                .finally(() => { if (!cancelled && generation.current === requestGeneration) { setLoading(false); pendingReload.current = false; } });
        }, 200);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [searchTerm, selectedCategory, categories, categoriesLoaded, requestVersion]);

    const returnTo = academyCoursesHref(searchTerm, selectedCategory);
    const updateFilters = (search: string, category: string) => {
        generation.current += 1;
        pendingReload.current = true;
        pendingMore.current = false;
        setLoadingMore(false);
        const query = search.trim();
        activeFilters.current = { search: query, category };
        setSearchDraft(query);
        setSearchTerm(query);
        setSelectedCategory(category);
        setLoading(true);
        setError('');
        setMoreError('');
        setRequestVersion((current) => current + 1);
        router.replace(academyCoursesHref(query, category), { scroll: false });
    };
    const loadMore = async () => {
        if (pendingReload.current || pendingMore.current) return;
        pendingMore.current = true;
        const requestGeneration = generation.current;
        setLoadingMore(true);
        setMoreError('');
        try {
            const categoryId = categories.find((item) => item.name === selectedCategory)?.id;
            const next = await listAcademyCourses({
                search: searchTerm,
                categoryId,
                page: Math.floor(courses.length / 100) + 1,
                limit: 100,
            });
            if (generation.current !== requestGeneration) return;
            setCourses((current) => [...current, ...next.items]);
            setTotal(next.total);
        } catch (reason) {
            if (generation.current === requestGeneration) setMoreError(reason instanceof AcademyError ? reason.message : 'โหลดคอร์สเพิ่มเติมไม่สำเร็จ');
        } finally {
            if (generation.current === requestGeneration) { setLoadingMore(false); pendingMore.current = false; }
        }
    };

    return (
        <div className={styles.page}>
            <LearningBanner title="คอร์สทั้งหมด" />
            <div className={`${styles.container} ${styles.backRow}`}><AcademyBackLink href="/learning" destination="Pharmacy Academy" /></div>
            <section className={styles.searchSection}>
                <div className={styles.container}>
                    <CourseFilters
                        categories={[ALL, ...categories.map((item) => item.name)]}
                        selectedCategory={selectedCategory}
                        searchTerm={searchDraft}
                        onCategoryChange={(category) => updateFilters(searchDraft, category)}
                        onSearchChange={setSearchDraft}
                        onSearch={() => updateFilters(searchDraft, selectedCategory)}
                    />
                    {categoryError && <div className={styles.categoryError} role="alert">
                        <p>{categoryError}</p>
                        <button type="button" className={styles.resetButton} onClick={() => {
                            setCategoriesLoaded(false);
                            generation.current += 1;
                            pendingReload.current = true;
                            setLoading(true);
                            setCategoryError('');
                            setCategoryRequest((current) => current + 1);
                        }}>โหลดหมวดหมู่อีกครั้ง</button>
                    </div>}
                </div>
            </section>
            <section className={styles.coursesSection}>
                <div className={styles.container}>
                    <div className={styles.resultsBar}>
                        <div className={styles.resultsCount} aria-live="polite">{loading ? 'กำลังค้นหาคอร์ส...' : <>พบทั้งหมด <span>{total}</span> รายการ</>}</div>
                    </div>
                    {error ? <div className={styles.emptyState} role="alert"><p>{error}</p><button type="button" className={styles.resetButton} onClick={() => updateFilters(searchTerm, selectedCategory)}>ลองอีกครั้ง</button></div> : loading ? (
                        <AcademySkeleton label="กำลังโหลดคอร์ส..." count={6} />
                    ) : courses.length > 0 ? (
                        <div className={styles.grid}>
                            {courses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    id={course.id}
                                    title={course.title}
                                    category={course.categoryName}
                                    duration={course.durationLabel || durationLabel(course.durationMinutes)}
                                    cpe={`${Number(course.cpeCredits).toLocaleString('th-TH')} หน่วยกิต`}
                                    image={course.thumbnailUrl}
                                    returnTo={returnTo}
                                    instructor={course.instructorName}
                                    price={course.price}
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
                    {!loading && !error && moreError && <p className={styles.categoryError} role="alert">{moreError}</p>}
                    {!loading && !error && courses.length < total && (
                        <button type="button" className={styles.resetButton} onClick={loadMore} disabled={loadingMore}>
                            {loadingMore ? 'กำลังโหลด...' : moreError ? 'ลองโหลดเพิ่มเติมอีกครั้ง' : 'ดูคอร์สเพิ่มเติม'}
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
