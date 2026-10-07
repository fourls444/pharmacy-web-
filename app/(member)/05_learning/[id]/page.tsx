"use client";

import AcademySkeleton from '@/components/member/learning/AcademySkeleton';

import AcademyImagePlaceholder from '@/components/member/learning/AcademyImagePlaceholder';

import { useEffect, useState, type MouseEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import AcademyImage from '@/components/member/learning/AcademyImage';
import { AlertCircle, ArrowRight, Award, Check, Clock, UserRound } from 'lucide-react';
import styles from './course-detail.module.css';
import AcademyBackLink from '@/components/member/learning/AcademyBackLink';
import { academyCheckoutHref, academySource } from '@/lib/academy/navigation';
import { AcademyCourse, AcademyError, AcademyReview, createAcademyOrder, getAcademyCourse, getAcademyEnrollments, listAcademyReviews } from '@/lib/academy/client';

function durationLabel(minutes: number) {
    if (!minutes) return 'เรียนตามเวลาของคุณ';
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return `${hours ? `${hours} ชั่วโมง` : ''}${hours && remainder ? ' ' : ''}${remainder ? `${remainder} นาที` : ''}`;
}

function trainingDate(value: string) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Bangkok',
    }).format(date);
}

function scrollToSection(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const section = document.getElementById(event.currentTarget.hash.slice(1));
    if (!section) return;
    event.preventDefault();
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    section.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
}

export default function CourseDetailPage() {
    const { id: rawId } = useParams<{ id: string }>();
    const courseId = Number(rawId);
    const router = useRouter();
    const searchParams = useSearchParams();
    const source = academySource(searchParams.get('from'));
    const [course, setCourse] = useState<AcademyCourse | null>(null);
    const [enrolled, setEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [reviews, setReviews] = useState<AcademyReview[]>([]);
    const [reviewStatus, setReviewStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [loadVersion, setLoadVersion] = useState(0);
    const [reviewVersion, setReviewVersion] = useState(0);

    useEffect(() => {
        setLoading(true);
        setError('');
        setCourse(null);
        setEnrolled(false);
        if (!Number.isInteger(courseId) || courseId < 1) {
            setError('ไม่พบคอร์สที่ต้องการ');
            setLoading(false);
            return;
        }
        let cancelled = false;
        Promise.all([getAcademyCourse(courseId), getAcademyEnrollments().catch((reason: unknown) => {
            if (reason instanceof AcademyError && reason.status === 401) return [];
            throw reason;
        })])
            .then(([courseData, enrollments]) => {
                if (cancelled) return;
                setCourse(courseData);
                setEnrolled(enrollments.some((item) => item.courseId === courseId && item.status === 'active'));
            })
            .catch((reason: unknown) => {
                if (cancelled) return;
                setError(reason instanceof AcademyError ? reason.message : 'โหลดรายละเอียดคอร์สไม่สำเร็จ');
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [courseId, loadVersion]);

    useEffect(() => {
        if (!course) return;
        setReviewStatus('loading');
        setReviews([]);
        let active = true;
        listAcademyReviews().then((items) => {
            if (items.some(item => !Number.isInteger(item.courseId))) throw new Error('Review response is missing course IDs');
            if (active) { setReviews(items.filter((item) => item.courseId === course.id)); setReviewStatus('ready'); }
        }).catch(() => { if (active) setReviewStatus('error'); });
        return () => { active = false; };
    }, [course, reviewVersion]);

    const handleEnroll = async () => {
        if (!course || busy) return;
        setBusy(true);
        setError('');
        try {
            const result = await createAcademyOrder(course.id);
            if (result.type === 'payment_required') {
                router.push(academyCheckoutHref(result.order.id, source));
            } else {
                setEnrolled(true);
            }
        } catch (reason) {
            setError(reason instanceof AcademyError ? reason.message : 'ลงทะเบียนไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setBusy(false);
        }
    };

    if (loading || !course) return <main className={styles.page}><div className={styles.container}>
        <div className={styles.backRow}><AcademyBackLink href={source} destination={source.startsWith('/learning/courses') ? 'คอร์สทั้งหมด' : 'Pharmacy Academy'} /></div>
        <div className={styles.state} role={loading ? undefined : 'alert'}>
            {loading ? <AcademySkeleton label="กำลังโหลดรายละเอียดคอร์ส..." variant="detail" count={2} /> : <><AlertCircle size={22} aria-hidden="true" /><p>{error || 'ไม่พบคอร์ส'}</p>
                <button type="button" className={styles.enrollButton} onClick={() => setLoadVersion((current) => current + 1)}>ลองอีกครั้ง</button></>}
        </div>
    </div></main>;

    const isClosed = Boolean(course.enrollmentDeadline && new Date(course.enrollmentDeadline).getTime() < Date.now());
    const price = Number(course.price);

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <div className={styles.backRow}>
                    <AcademyBackLink href={source} destination={source.startsWith('/learning/courses') ? 'คอร์สทั้งหมด' : 'Pharmacy Academy'} />
                </div>
                <div className={styles.hero}>
                    <div className={styles.cover}>
                        {course.thumbnailUrl ? <AcademyImage src={course.thumbnailUrl} alt={course.title} fill priority
                            sizes="(max-width: 850px) calc(100vw - 40px), (max-width: 1280px) 66vw, 800px" /> :
                            <AcademyImagePlaceholder />}
                    </div>
                    <article className={styles.content}>
                        <div className={styles.labels}>
                            {course.categoryName && <span className={styles.category}>{course.categoryName}</span>}
                            {course.format && <span className={styles.format}>{course.format === 'onsite' ? 'คอร์สออนไซต์' : 'คอร์สออนไลน์'}</span>}
                        </div>
                        <h1>{course.title}</h1>
                        {course.summary && <p className={styles.summary}>{course.summary}</p>}
                        <div className={styles.facts}>
                            <span><Clock size={18} aria-hidden="true" />{course.durationLabel || durationLabel(course.durationMinutes)}</span>
                            <span><Award size={18} aria-hidden="true" />{Number(course.cpeCredits).toLocaleString('th-TH')} หน่วยกิต CPE</span>
                        </div>
                        <nav className={styles.sectionNav} aria-label="เนื้อหาคอร์ส">
                            <a href="#course-details" onClick={scrollToSection}>รายละเอียด</a>
                            <a href="#course-lessons" onClick={scrollToSection}>บทเรียน</a>
                            <a href="#course-instructor" onClick={scrollToSection}>ผู้สอน</a>
                            <a href="#course-reviews" onClick={scrollToSection}>รีวิว</a>
                        </nav>
                    </article>
                    <aside className={styles.enrollPanel} aria-label="ลงทะเบียนคอร์ส">
                        <div className={styles.priceBlock}>
                            <p className={styles.panelLabel}>ค่าลงทะเบียน</p>
                            <p className={styles.price}>{price > 0 ? `${price.toLocaleString('th-TH')} บาท` : 'ไม่มีค่าใช้จ่าย'}</p>
                        </div>
                        <dl className={styles.enrollFacts}>
                            {course.format && <div><dt>รูปแบบ</dt><dd>{course.format === 'onsite' ? 'ออนไซต์' : 'ออนไลน์'}</dd></div>}
                            <div><dt>ระยะเวลา</dt><dd>{course.durationLabel || durationLabel(course.durationMinutes)}</dd></div>
                            <div><dt>หน่วยกิต CPE</dt><dd>{Number(course.cpeCredits).toLocaleString('th-TH')}</dd></div>
                            {course.format === 'onsite' && course.trainingStartsAt && trainingDate(course.trainingStartsAt) && <div className={styles.venueFact}><dt>เริ่มอบรม</dt><dd>{trainingDate(course.trainingStartsAt)} น.</dd></div>}
                            {course.format === 'onsite' && course.trainingEndsAt && trainingDate(course.trainingEndsAt) && <div className={styles.venueFact}><dt>สิ้นสุดอบรม</dt><dd>{trainingDate(course.trainingEndsAt)} น.</dd></div>}
                            {course.venue && <div className={styles.venueFact}><dt>สถานที่</dt><dd>{course.venue}</dd></div>}
                            {course.enrollmentDeadline && <div><dt>รับสมัครถึง</dt><dd>{new Date(course.enrollmentDeadline).toLocaleDateString('th-TH')}</dd></div>}
                        </dl>
                        <div className={styles.enrollAction}>
                            {isClosed && <p className={styles.closed}>คอร์สปิดรับสมัครแล้ว</p>}
                            {enrolled && <p className={styles.success}>คุณลงทะเบียนคอร์สนี้แล้ว</p>}
                            {error && <p className={styles.error} role="alert">{error}</p>}
                            <button className={styles.enrollButton} type="button" onClick={handleEnroll} disabled={busy || enrolled || isClosed}>
                                {busy ? 'กำลังดำเนินการ...' : enrolled ? 'ลงทะเบียนแล้ว' : isClosed ? 'ปิดรับสมัคร' : price > 0 ? 'ลงทะเบียนและไปชำระเงิน' : 'ลงทะเบียนเรียน'}
                                {!busy && !enrolled && !isClosed && <ArrowRight size={18} aria-hidden="true" />}
                            </button>
                        </div>
                        <p className={styles.note}>ขั้นตอนลงทะเบียนเป็นการจำลองในเบราว์เซอร์ ยังไม่บันทึกในระบบ Academy</p>
                    </aside>
                    <div className={styles.moreInfo}>
                        <section id="course-details" className={styles.detailsSection}>
                            <h2>รายละเอียดคอร์ส</h2>
                            <p>{course.details || course.summary || 'ยังไม่มีรายละเอียดเพิ่มเติมสำหรับคอร์สนี้'}</p>
                            {course.learningOutcomes && course.learningOutcomes.length > 0 && <div className={styles.outcomesSection}>
                                <h3>สิ่งที่จะได้เรียนรู้</h3>
                                <ul>{course.learningOutcomes.map((outcome) => <li key={outcome}><Check size={18} aria-hidden="true" />{outcome}</li>)}</ul>
                            </div>}
                        </section>
                        <section id="course-lessons" className={styles.curriculumSection}>
                            <h2>บทเรียนในคอร์ส</h2>
                            {course.curriculum && course.curriculum.length > 0 ? <ol>
                                {course.curriculum.map((topic, index) => <li key={`${index}-${topic}`}><span>{String(index + 1).padStart(2, '0')}</span>{topic}</li>)}
                            </ol> : <p>ยังไม่มีรายการบทเรียนสำหรับคอร์สนี้</p>}
                        </section>
                        <section id="course-instructor" className={styles.instructorSection}>
                            <h2>ผู้สอน</h2>
                            <p><UserRound size={20} aria-hidden="true" />{course.instructorName || 'ทีมผู้สอน Pharmacy Academy'}</p>
                        </section>
                        <section id="course-reviews" className={styles.reviewsSection}>
                            <h2>รีวิวจากผู้เรียน</h2>
                            {reviewStatus === 'loading' ? <AcademySkeleton label="กำลังโหลดรีวิว..." variant="lines" count={2} /> : reviewStatus === 'error' ? <div role="status"><p>โหลดรีวิวไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</p><button type="button" className={styles.retryButton} onClick={() => setReviewVersion((current) => current + 1)}>โหลดรีวิวอีกครั้ง</button></div> : reviews.length === 0 ? <p>ยังไม่มีรีวิวสำหรับคอร์สนี้</p> :
                                <div className={styles.reviewList}>{reviews.map((review) => <article key={review.id}>
                                    <p className={styles.reviewRating}>คะแนน {review.rating} จาก 5</p>
                                    <p>{review.body}</p><p className={styles.reviewer}>{review.reviewerName}</p>
                                </article>)}</div>}
                        </section>
                    </div>
                </div>
            </div>
        </main>
    );
}
