"use client";

import styles from "./LearningBanner.module.css";

export default function LearningBanner() {
    return (
        <div className={styles.banner}>
            <div className={styles.bannerOverlay}>
                <div className={styles.bannerContent}>
                    <h1 className={`${styles.bannerTitle} ThaiFont`}>Pharmacy Academy</h1>
                    <p className={`${styles.bannerSubtitle} ThaiFont`}>
                        ยกระดับทักษะและวิชาชีพเภสัชกรรม ด้วยคอร์สเรียนออนไลน์ที่หลากหลายและทันสมัย
                    </p>
                </div>
            </div>
        </div>
    );
}
