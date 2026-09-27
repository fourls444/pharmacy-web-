"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { AlertCircle, ArrowRight, Award, Check, Clock, GraduationCap, UserRound } from 'lucide-react';
import styles from './course-detail.module.css';
import AcademyBackLink from '@/components/member/learning/AcademyBackLink';
import { academyCheckoutHref, academySource } from '@/lib/academy/navigation';
import { AcademyCourse, AcademyError, createAcademyOrder, getAcademyCourse, getAcademyEnrollments } from '@/lib/academy/client';

function durationLabel(minutes: number) {
    if (!minutes) return 'เรียนตามเวลาของคุณ';
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return `${hours ? `${hours} ชั่วโมง` : ''}${hours && remainder ? ' ' : ''}${remainder ? `${remainder} นาที` : ''}`;
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

    useEffect(() => {
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
    }, [courseId]);

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

    if (loading) return <main className={styles.state}>กำลังโหลดรายละเอียดคอร์ส...</main>;
    if (!course) return <main className={styles.state} role="alert"><AlertCircle size={22} />{error || 'ไม่พบคอร์ส'}</main>;

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
                        {course.thumbnailUrl ? (
                            <Image src={course.thumbnailUrl} alt={course.title} fill priority sizes="(max-width: 850px) 100vw, 480px" />
                        ) : (
                            <div className={styles.coverPlaceholder}><GraduationCap size={52} /></div>
                        )}
                    </div>
                    <article className={styles.content}>
                        <div className={styles.labels}>
                            <span className={styles.category}>{course.categoryName || 'Pharmacy Academy'}</span>
                            <span className={styles.format}>คอร์สออนไลน์</span>
                        </div>
                        <h1>{course.title}</h1>
                        {course.summary && <p className={styles.summary}>{course.summary}</p>}
                        <div className={styles.facts}>
                            <span><Clock size={18} />{durationLabel(course.durationMinutes)}</span>
                            <span><Award size={18} />{Number(course.cpeCredits).toLocaleString('th-TH')} หน่วยกิต CPE</span>
                        </div>
                        <div className={styles.enrollPanel} aria-label="ลงทะเบียนคอร์ส">
                            <div className={styles.priceBlock}>
                                <p className={styles.panelLabel}>ค่าลงทะเบียน</p>
                                <p className={styles.price}>{price > 0 ? `${price.toLocaleString('th-TH')} บาท` : 'ไม่มีค่าใช้จ่าย'}</p>
                            </div>
                            <div className={styles.enrollAction}>
                                {isClosed && <p className={styles.closed}>คอร์สปิดรับสมัครแล้ว</p>}
                                {enrolled && <p className={styles.success}>คุณลงทะเบียนคอร์สนี้แล้ว</p>}
                                {error && <p className={styles.error} role="alert">{error}</p>}
                                <button className={styles.enrollButton} type="button" onClick={handleEnroll} disabled={busy || enrolled || isClosed}>
                                    {busy ? 'กำลังดำเนินการ...' : enrolled ? 'ลงทะเบียนแล้ว' : isClosed ? 'ปิดรับสมัคร' : price > 0 ? 'ลงทะเบียนและไปชำระเงิน' : 'ลงทะเบียนเรียน'}
                                    {!busy && !enrolled && !isClosed && <ArrowRight size={18} aria-hidden="true" />}
                                </button>
                            </div>
                            <p className={styles.note}>ลงทะเบียนด้วยบัญชีสมาชิกเภสัชกรของคุณ</p>
                        </div>
                    </article>
                </div>
                <div className={styles.moreInfo}>
                    {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                        <section className={styles.outcomesSection}>
                            <h2>สิ่งที่จะได้เรียนรู้</h2>
                            <ul>
                                {course.learningOutcomes.map((outcome) => <li key={outcome}><Check size={18} aria-hidden="true" />{outcome}</li>)}
                            </ul>
                        </section>
                    )}
                    {course.curriculum && course.curriculum.length > 0 && (
                        <section className={styles.curriculumSection}>
                            <h2>เนื้อหาคอร์ส</h2>
                            <ol>
                                {course.curriculum.map((topic, index) => <li key={topic}><span>{String(index + 1).padStart(2, '0')}</span>{topic}</li>)}
                            </ol>
                        </section>
                    )}
                    {course.details && course.details !== course.summary && (
                        <section className={styles.detailsSection}>
                            <h2>เกี่ยวกับคอร์สนี้</h2>
                            <p>{course.details}</p>
                        </section>
                    )}
                    <section className={styles.instructorSection}>
                        <h2>ผู้สอน</h2>
                        <p><UserRound size={19} aria-hidden="true" />{course.instructorName || 'ทีมผู้สอน Pharmacy Academy'}</p>
                    </section>
                </div>
            </div>
        </main>
    );
}
