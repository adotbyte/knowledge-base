'use client';

import { useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const CustomLightbox = dynamic(() => import('@/components/Lightbox'), { ssr: false });

// Apibrėžiame propsų tipą
interface LightboxImageProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
}

export default function LightboxImage({ src, alt, width, height }: LightboxImageProps) {
  const [open, setOpen] = useState(false);

  // Paverčiame width ir height į skaičius, jei jie ateina kaip string (pvz., iš HTML atributų)
  const numWidth = typeof width === 'string' ? parseInt(width, 10) : width;
  const numHeight = typeof height === 'string' ? parseInt(height, 10) : height;

  const slides = [
    {
      src,
      alt: alt || '',
      width: numWidth && !isNaN(numWidth) ? numWidth : 1920,
      height: numHeight && !isNaN(numHeight) ? numHeight : 1080,
    },
  ];

  return (
    <>
      <img
        src={src}
        alt={alt || ''}
        className="my-4 h-auto max-w-full cursor-zoom-in rounded-lg shadow-sm"
        onClick={() => setOpen(true)}
        loading="lazy"
      />
      <CustomLightbox open={open} close={() => setOpen(false)} slides={slides} index={0} />
    </>
  );
}
