"use client";

import React from 'react';
import { Quote, Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import styles from './LearnerReviews.module.css';
import SectionHeader from '@/components/ui/SectionHeader';
import type { AcademyReview } from '@/lib/academy/client';

export default function LearnerReviews({ reviews, showAll = false }: { reviews: AcademyReview[]; showAll?: boolean }) {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                {!showAll && <SectionHeader
                    title="รีวิวจากผู้เรียน"
                    viewAllHref={showAll ? undefined : '/learning/reviews'}
                    viewAllText="ดูทั้งหมด"
                />}
                {reviews.length === 0 && <p className={styles.empty}>ยังไม่มีรีวิวจากผู้เรียน</p>}

                {reviews.length > 0 && <div className={showAll ? styles.allGrid : styles.sliderContainer}>
                    {showAll ? reviews.map((review) => <ReviewCard key={review.id} review={review} />) : <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={24}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        breakpoints={{
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 }
                        }}
                        className={styles.swiper}
                    >
                        {reviews.slice(0, 8).map((review) => (
                            <SwiperSlide key={review.id} style={{ height: 'auto' }}>
                                <ReviewCard review={review} />
                            </SwiperSlide>
                        ))}
                    </Swiper>}
                </div>}
            </div>
        </section>
    );
}

function ReviewCard({ review }: { review: AcademyReview }) {
    return (
        <div className={styles.card}>
                                    <div className={styles.quoteWatermark}>
                                        <Quote size={80} fill="var(--primary-olive)" />
                                    </div>
                                    <div className={styles.rating} role="img" aria-label={`คะแนน ${review.rating} จาก 5`}>
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                fill={i < review.rating ? "#FFB800" : "none"}
                                                color={i < review.rating ? "#FFB800" : "#E5E7EB"}
                                            />
                                        ))}
                                    </div>
                                    <p className={styles.comment}>“{review.body}”</p>
                                    <div className={styles.courseBadge}>
                                        <span className={styles.courseLabel}>คอร์สเรียน:</span>
                                        <span className={styles.courseName}>{review.courseTitle || 'คอร์สเรียน'}</span>
                                    </div>
                                    <div className={styles.footer}>
                                        <div className={styles.avatarWrapper}>
                                            <span aria-hidden="true">{review.reviewerName.slice(0, 1)}</span>
                                        </div>
                                        <div className={styles.info}>
                                            <h4 className={styles.name}>{review.reviewerName}</h4>
                                            <p className={styles.role}>{review.reviewerRole || 'ผู้เรียน'}</p>
                                        </div>
                                    </div>
        </div>
    );
}
