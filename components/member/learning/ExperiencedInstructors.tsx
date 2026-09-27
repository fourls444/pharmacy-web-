"use client";

import React from 'react';
import Image from 'next/image';
import styles from './ExperiencedInstructors.module.css';
import SectionHeader from '@/components/ui/SectionHeader';

const INSTRUCTORS = [
    {
        id: 1,
        name: "ภญ. ดร. วิภาวดี เรียนรู้",
        title: "ผู้เชี่ยวชาญด้านเภสัชกรรมคลินิก",
        expertise: "Pharmacotherapy & Patient Care",
        image: "/images/public/learning/instructors/female_1.png"
    },
    {
        id: 2,
        name: "ภก. สมชาย รักดี",
        title: "เภสัชกรเชี่ยวชาญพิเศษ",
        expertise: "Hospital Pharmacy Management",
        image: "/images/public/learning/instructors/male_1.png"
    },
    {
        id: 3,
        name: "ภญ. นงลักษณ์ ใจดี",
        title: "รองศาสตราจารย์ ดร.",
        expertise: "Clinical Research & Drug Safety",
        image: "/images/public/learning/instructors/female_2.png"
    },
    {
        id: 4,
        name: "ภก. อนันต์ กาญจนภา",
        title: "เภสัชกรนักวิจัย",
        expertise: "Digital Health & AI in Pharmacy",
        image: "/images/public/learning/instructors/male_2.png"
    }
];

export default function ExperiencedInstructors() {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <SectionHeader 
                    title="วิทยากรผู้เชี่ยวชาญ" 
                />
                
                <p className={styles.subtitle}>เรียนรู้จากประสบการณ์จริงของเภสัชกรและคณาจารย์ผู้ทรงคุณวุฒิในสายวิชาชีพ</p>

                <div className={styles.grid}>
                    {INSTRUCTORS.map((instructor) => (
                        <div key={instructor.id} className={styles.card}>
                            <div className={styles.imageWrapper}>
                                <Image 
                                    src={instructor.image} 
                                    alt={instructor.name} 
                                    fill 
                                    className={styles.image}
                                />
                            </div>
                            <div className={styles.info}>
                                <h3 className={styles.name}>{instructor.name}</h3>
                                <p className={styles.title}>{instructor.title}</p>
                                <span className={styles.expertise}>{instructor.expertise}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
