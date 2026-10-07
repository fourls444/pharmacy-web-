import { ImageIcon } from 'lucide-react';
import styles from './AcademyFeedback.module.css';

export default function AcademyImagePlaceholder() {
    return <div className={styles.imagePlaceholder} aria-hidden="true"><ImageIcon size={48} strokeWidth={1.5} /></div>;
}
