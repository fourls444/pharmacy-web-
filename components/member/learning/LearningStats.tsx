"use client";

import styles from "./LearningStats.module.css";
import type { AcademyStats } from '@/lib/academy/client';

export default function LearningStats({ data }: { data: AcademyStats | null }) {
  if (!data) return null;
  const stats = [
    { label: "คอร์สเรียนทั้งหมด", value: data.courseCount },
    { label: "สมาชิกเข้าเรียน", value: data.learnerCount },
    { label: "วิทยากรผู้เชี่ยวชาญ", value: data.instructorCount },
  ];

  return (
    <section className={styles.statsSection}>
      <div className={styles.statsContainer}>
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statItem}>
              <div className={styles.statIconWrapper}>
                <div className={styles.statIconGlow} aria-hidden="true" />
                <h3 className={styles.statNumber}>
                  {stat.value.toLocaleString('th-TH')}
                  <span className={styles.numberShine} aria-hidden="true" />
                </h3>
              </div>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
