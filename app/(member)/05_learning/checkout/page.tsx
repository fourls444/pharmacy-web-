"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';
import styles from './checkout.module.css';
import AcademyBackLink from '@/components/member/learning/AcademyBackLink';
import BackLink from '@/components/ui/BackLink';
import { academyCourseHref, academySource } from '@/lib/academy/navigation';
import { AcademyError, AcademyOrder, completeMockAcademyOrder, getAcademyOrder } from '@/lib/academy/client';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const source = academySource(searchParams.get('from'));
    const orderId = Number(searchParams.get('orderId'));
    const [order, setOrder] = useState<AcademyOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!Number.isInteger(orderId) || orderId < 1) {
            setError('ไม่พบคำสั่งซื้อที่ต้องการ');
            setLoading(false);
            return;
        }
        let cancelled = false;
        getAcademyOrder(orderId)
            .then((result) => { if (!cancelled) setOrder(result); })
            .catch((reason: unknown) => {
                if (!cancelled) setError(reason instanceof AcademyError ? reason.message : 'โหลดคำสั่งซื้อไม่สำเร็จ');
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [orderId]);

    const completePayment = async () => {
        if (!order || busy) return;
        setBusy(true);
        setError('');
        try {
            const result = await completeMockAcademyOrder(order.id);
            setOrder({ ...order, status: result.status });
        } catch (reason) {
            setError(reason instanceof AcademyError ? reason.message : 'ดำเนินการไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setBusy(false);
        }
    };

    if (loading) return <main className={styles.state}>กำลังโหลดคำสั่งซื้อ...</main>;
    if (!order) return <main className={styles.state} role="alert"><AlertCircle size={22} />{error || 'ไม่พบคำสั่งซื้อ'}</main>;

    const completed = order.status === 'mock_paid';
    const detailHref = academyCourseHref(order.courseId, source);

    return (
        <main className={styles.page}>
            <div className={styles.container}>
                <div className={styles.backRow}><AcademyBackLink href={detailHref} destination="รายละเอียดคอร์ส" /></div>
                <div className={styles.heading}>
                    <p>PHARMACY ACADEMY</p>
                    <h1>{completed ? 'ลงทะเบียนสำเร็จ' : 'ยืนยันการลงทะเบียน'}</h1>
                </div>
                <section className={styles.panel}>
                    <div className={styles.summaryColumn}>
                        <div className={styles.summaryHeading}>
                            {completed ? <CheckCircle2 className={styles.successIcon} size={28} /> : <CreditCard className={styles.paymentIcon} size={28} />}
                            <h2>สรุปรายการ</h2>
                        </div>
                        <div className={styles.orderInfo}>
                            <span>คอร์สที่เลือก</span>
                            <strong>{order.courseTitle || `คอร์ส #${order.courseId}`}</strong>
                        </div>
                        <div className={styles.amount}>
                            <span>ยอดที่ต้องชำระ</span>
                            <strong>{Number(order.amountSnapshot).toLocaleString('th-TH')} บาท</strong>
                        </div>
                    </div>
                    <div className={styles.actionColumn}>
                        <h2>{completed ? 'พร้อมเริ่มเรียน' : 'ขั้นตอนยืนยัน'}</h2>
                        {completed ? (
                            <>
                                <p className={styles.successMessage}>ระบบบันทึกการลงทะเบียนของคุณแล้ว</p>
                                <Link className={styles.primaryLink} href="/learning">ไปหน้า Pharmacy Academy</Link>
                            </>
                        ) : (
                            <>
                                <p className={styles.mockNotice}>ขั้นตอนนี้เป็นการจำลอง ไม่มีการเรียกเก็บเงินจริง</p>
                                {error && <p className={styles.error} role="alert">{error}</p>}
                                <button className={styles.primaryButton} type="button" onClick={completePayment} disabled={busy || order.status !== 'pending'}>
                                    {busy ? 'กำลังยืนยัน...' : 'จำลองชำระเงินสำเร็จ'}
                                </button>
                                <BackLink className={styles.secondaryButton} href={detailHref} title="กลับไปหน้ารายละเอียดคอร์ส">ย้อนกลับ</BackLink>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default function CheckoutPage() {
    return <Suspense fallback={<main className={styles.state}>กำลังโหลด...</main>}><CheckoutContent /></Suspense>;
}
