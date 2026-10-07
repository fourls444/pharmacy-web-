'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
import AcademyImagePlaceholder from './AcademyImagePlaceholder';

export default function AcademyImage(props: ImageProps) {
    const [failedSource, setFailedSource] = useState<ImageProps['src'] | null>(null);
    if (failedSource === props.src) return props.fill ? <AcademyImagePlaceholder /> :
        <span style={{ display: 'inline-block', position: 'relative', width: props.width || '100%', height: props.height || '100%' }}><AcademyImagePlaceholder /></span>;
    return <Image {...props} alt={props.alt} onError={(event) => { setFailedSource(props.src); props.onError?.(event); }} />;
}
