"use client";

import { Search, ChevronDown, ListFilter } from 'lucide-react';
import styles from './CourseFilters.module.css';

interface CourseFiltersProps {
    categories: string[];
    selectedCategory: string;
    searchTerm: string;
    onCategoryChange: (category: string) => void;
    onSearchChange: (term: string) => void;
    onSearch?: () => void;
}

export default function CourseFilters({ categories, selectedCategory, searchTerm, onCategoryChange, onSearchChange, onSearch }: CourseFiltersProps) {
    return (
        <form className={styles.wrapper} role="search" onSubmit={(event) => { event.preventDefault(); onSearch?.(); }}>
            <div className={styles.header}>
                <h2 className={styles.title}>ค้นหาคอร์สเรียน</h2>
                <span className={styles.subtitle}>ค้นหาหลักสูตรที่คุณสนใจเพื่อพัฒนาวิชาชีพ</span>
            </div>
            <div className={styles.searchRow}>
                <div className={styles.dropdown}>
                    <ListFilter size={18} className={styles.dropdownIcon} aria-hidden="true" />
                    <select className={styles.dropdownButton} aria-label="เลือกหมวดหมู่คอร์ส" value={selectedCategory}
                        onChange={(event) => onCategoryChange(event.target.value)}>
                        {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                    <ChevronDown size={18} className={styles.chevron} aria-hidden="true" />
                </div>
                <div className={styles.inputWrap}>
                    <Search size={18} className={styles.inputIcon} aria-hidden="true" />
                    <input type="text" className={styles.input} aria-label="ค้นหาคอร์ส"
                        placeholder="ชื่อคอร์ส, วิทยากร หรือเนื้อหา..." value={searchTerm}
                        onChange={(event) => onSearchChange(event.target.value)} />
                </div>
                <button type="submit" className={styles.searchButton}>ค้นหา</button>
            </div>
        </form>
    );
}
