'use client';

import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Image from 'next/image';
import {
  isImageFitCover,
  isImageSlide,
  useLightboxProps,
  useLightboxState,
} from 'yet-another-react-lightbox';

function NextJsImage({ slide, offset, rect }) {
  // <-- Pašalinta : any
  const {
    on: { click },
    carousel: { imageFit },
  } = useLightboxProps();
  const { currentIndex } = useLightboxState();
  const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit);

  if (!isImageSlide(slide) || typeof slide.width !== 'number' || typeof slide.height !== 'number') {
    return undefined;
  }

  const width = !cover
    ? Math.round(Math.min(rect.width, (rect.height / slide.height) * slide.width))
    : rect.width;

  const height = !cover
    ? Math.round(Math.min(rect.height, (rect.width / slide.width) * slide.height))
    : rect.height;

  return (
    <div style={{ position: 'relative', width, height }}>
      <Image
        fill
        alt={slide.alt || ''}
        src={slide}
        loading="eager"
        draggable={false}
        style={{ objectFit: cover ? 'cover' : 'contain', cursor: click ? 'pointer' : undefined }}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        onClick={offset === 0 ? () => click?.({ index: currentIndex }) : undefined}
      />
    </div>
  );
}

export default function CustomLightbox({ open, close, slides, index = 0 }) {
  // <-- Pašalinta : any
  return (
    <Lightbox
      open={open}
      close={close}
      slides={slides}
      index={index}
      render={{ slide: NextJsImage }}
    />
  );
}
