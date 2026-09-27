'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Award, ArrowRight } from 'lucide-react';
import styles from './CourseCard.module.css';
import { academyCourseHref, type AcademySource } from '@/lib/academy/navigation';

interface CourseCardProps {
    id: number;
    title: string;
    category: string;
    duration: string;
    cpe: string;
    image: string;
    getCategoryColor: (category: string) => string;
    returnTo: AcademySource;
}

export default function CourseCard({ id, title, category, duration, cpe, image, getCategoryColor, returnTo }: CourseCardProps) {
    return (
        <Link href={academyCourseHref(id, returnTo)} className={styles.card}>
            <div className={styles.imageWrapper}>
                <Image 
                    src={image} 
                    alt={title} 
                    fill 
                    className={styles.image} 
                />
                <div
                    className={styles.badge}
                    style={{ backgroundColor: getCategoryColor(category) }}
                >
                    {category}
                </div>
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
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
                <div className={styles.footer}>
                    <div className={styles.enrollBtn}>
                        <span>เข้าสู่บทเรียน</span>
                        <ArrowRight size={16} className={styles.arrow} />
                    </div>
                </div>
            </div>
        </Link>
    );
}
