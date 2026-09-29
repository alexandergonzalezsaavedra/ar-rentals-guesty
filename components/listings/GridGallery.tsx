'use client';
import { useEffect, useRef, useState } from 'react';
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';
import Image from 'next/image';
import { IconZoomIn } from '@tabler/icons-react';

interface GridGalleryProps {
  images: Array<{ url: string; name?: string; category?: string }>;
  imageContainerClassName?: boolean;
  quantityImageRow?: 3 | 4;
  containerHeightClassName?: string;
  initialVisibleCount?: number;
}

const GridGallery = ({
  images,
  imageContainerClassName,
  quantityImageRow = 3,
  containerHeightClassName,
  initialVisibleCount = 18,
}: GridGalleryProps) => {
  const widthClass =
    quantityImageRow === 3 ? 'w-1/2 lg:w-1/3' : 'w-1/2 lg:w-1/4';
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [imageData, setImageData] = useState<
    Array<{
      url: string;
      name?: string;
      category?: string;
      width: number;
      height: number;
    }>
  >([]);

  const visibleImages = images.slice(0, visibleCount);
  const remainingCount = images.length - visibleImages.length;

  useEffect(() => {
    let lightbox: PhotoSwipeLightbox | null = null;

    if (galleryRef.current && imageData.length > 0) {
      lightbox = new PhotoSwipeLightbox({
        gallery: '#grid-gallery',
        children: 'a',
        pswpModule: () => import('photoswipe'),
      });

      lightbox.init();
    }

    return () => {
      lightbox?.destroy();
    };
  }, [imageData]);

  useEffect(() => {
    const loadDimensions = async () => {
      setIsLoading(true);

      const data = await Promise.all(
        visibleImages.map(async (image) => {
          return new Promise<{
            url: string;
            name?: string;
            width: number;
            height: number;
          }>((resolve) => {
            const img = new window.Image();
            img.onload = () => {
              resolve({
                ...image,
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            };
            img.onerror = () => {
              resolve({
                ...image,
                width: 800,
                height: 600,
              });
            };
            img.src = image.url;
          });
        }),
      );

      setImageData(data);
      setIsLoading(false);
    };

    if (visibleImages.length > 0) {
      loadDimensions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- visibleImages is derived from [images, visibleCount], which are already the deps here
  }, [images, visibleCount]);

  if (isLoading) {
    return (
      <div
        className={`flex flex-row items-center flex-wrap gap-4 ${
          quantityImageRow === 3
            ? 'justify-start'
            : 'justify-start sm:justify-center'
        }`}
      >
        {visibleImages.map((_, index) => (
          <div
            key={index}
            className={`${widthClass} p-2`}
          >
            <div className='w-full h-48 bg-gray-200 rounded-lg animate-pulse' />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      id='grid-gallery'
      ref={galleryRef}
      className={`flex flex-row items-center flex-wrap ${
        quantityImageRow === 3
          ? 'justify-start'
          : 'justify-start sm:justify-center'
      }`}
    >
      {imageData.map((image, index) => {
        const isLastVisible = index === imageData.length - 1;
        const showMoreOverlay = isLastVisible && remainingCount > 0;

        const imageBox = (
          <div
            className={
              containerHeightClassName
                ? `relative w-full overflow-hidden rounded-lg flex items-center ${containerHeightClassName}`
                : 'relative w-full overflow-hidden h-[110px] sm:h-[160px] rounded-lg flex items-center'
            }
          >
            <Image
              src={image.url}
              alt={image.name || `Image ${index + 1}`}
              width={400}
              height={250}
              className={
                imageContainerClassName
                  ? 'w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105'
                  : 'w-full h-auto object-cover rounded-lg transition-transform duration-300 group-hover:scale-105'
              }
              style={{
                aspectRatio: `${image.width} / ${image.height}`,
              }}
            />
            {showMoreOverlay && (
              <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-black/55 text-lg font-semibold text-white'>
                +{remainingCount} fotos
              </div>
            )}
            {!showMoreOverlay && (
              <div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/25 group-hover:opacity-100'>
                <IconZoomIn
                  size={22}
                  className='text-white drop-shadow'
                />
              </div>
            )}
          </div>
        );

        if (showMoreOverlay) {
          return (
            <button
              key={index}
              type='button'
              aria-label={`Ver ${remainingCount} fotos más`}
              onClick={() => setVisibleCount(images.length)}
              className={`${widthClass} p-2 group`}
            >
              {imageBox}
            </button>
          );
        }

        return (
          <a
            key={index}
            href={image.url}
            data-pswp-width={image.width}
            data-pswp-height={image.height}
            className={`${widthClass} p-2 group`}
          >
            {imageBox}
          </a>
        );
      })}
    </div>
  );
};

export default GridGallery;
