"use client";

import LearningBanner from "@/components/member/learning/LearningBanner";
import CourseFilters from "@/components/member/learning/courses/CourseFilters";
import PopularCategories from "@/components/member/learning/PopularCategories";
import FeaturedCourse from "@/components/member/learning/FeaturedCourse";
import PopularCourses from "@/components/member/learning/PopularCourses";
import ExperiencedInstructors from "@/components/member/learning/ExperiencedInstructors";
import LearningStats from "@/components/member/learning/LearningStats";
import LearnerReviews from "@/components/member/learning/LearnerReviews";
import styles from "./learning.module.css";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AcademyCategory, AcademyCourse, AcademyError, listAcademyCategories, listAcademyCourses } from '@/lib/academy/client';

export default function LearningPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
    const [categories, setCategories] = useState<AcademyCategory[]>([]);
    const [courses, setCourses] = useState<AcademyCourse[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        Promise.all([listAcademyCategories(), listAcademyCourses({ limit: 9 })])
            .then(([categoryItems, coursePage]) => {
                if (cancelled) return;
                setCategories(categoryItems);
                setCourses(coursePage.items);
            })
            .catch((reason: unknown) => {
                if (!cancelled) setError(reason instanceof AcademyError ? reason.message : 'โหลดคอร์สไม่สำเร็จ');
            });
        return () => { cancelled = true; };
    }, []);

    const openCourses = () => {
        const query = new URLSearchParams();
        if (searchTerm.trim()) query.set('search', searchTerm.trim());
        if (selectedCategory !== 'ทั้งหมด') query.set('category', selectedCategory);
        router.push(`/learning/courses${query.size ? `?${query}` : ''}`);
    };

    return (
        <div className={styles.page}>
            <LearningBanner />
            
            <div className={styles.container} style={{ marginTop: '3rem', marginBottom: '4rem' }}>
                <CourseFilters 
                    categories={['ทั้งหมด', ...categories.map((item) => item.name)]}
                    selectedCategory={selectedCategory}
                    searchTerm={searchTerm}
                    onCategoryChange={setSelectedCategory}
                    onSearchChange={setSearchTerm}
                    onSearch={openCourses}
                />
            </div>

            {error && <div className={styles.container} role="alert">{error}</div>}
            <PopularCategories categories={categories} />

            <FeaturedCourse courses={courses} />

            <ExperiencedInstructors />

            <LearningStats />

            <PopularCourses courses={courses} />

            <LearnerReviews />
        </div>
    );
}
