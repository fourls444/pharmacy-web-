'use client';

import AcademyImagePlaceholder from '@/components/member/learning/AcademyImagePlaceholder';

import React from 'react';
import Link from 'next/link';
import AcademyImage from '@/components/member/learning/AcademyImage';
import { Clock, Award, ArrowRight } from 'lucide-react';
import styles from './CourseCard.module.css';
import { academyCourseHref, type AcademySource } from '@/lib/academy/navigation';

interface CourseCardProps {
    id: number;
    title: string;
    category?: string | null;
    duration: string;
    cpe: string;
    image: string | null;
    returnTo: AcademySource;
    instructor?: string | null;
    price?: number | string;
}

export default function CourseCard({ id, title, category, duration, cpe, image, returnTo, instructor, price }: CourseCardProps) {
    return (
        <Link href={academyCourseHref(id, returnTo)} className={styles.card}>
            <div className={styles.imageWrapper}>
                {image ? <AcademyImage
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) calc(100vw - 40px), (max-width: 1024px) 50vw, 400px"
                    className={styles.image}
                /> : <AcademyImagePlaceholder />}
                {category && <div className={styles.badge}>{category}</div>}
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                {instructor && <p className={styles.instructor}>ผู้สอน: {instructor}</p>}
                <div className={styles.meta}>
                    <div className={styles.metaItem}>
                        <Clock size={16} />
                        <span>{duration}</span>
                    </div>
                    <div className={styles.metaItem}>
                        <Award size={16} />
                        <span>{cpe}</span>
                    </div>
                </div>
                {price !== undefined && <p className={styles.price}>{Number(price) > 0 ? `${Number(price).toLocaleString('th-TH')} บาท` : 'ไม่มีค่าใช้จ่าย'}</p>}
                <div className={styles.footer}>
                    <div className={styles.enrollBtn}>
                        <span>ดูรายละเอียด</span>
                        <ArrowRight size={16} className={styles.arrow} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
