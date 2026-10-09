import type { ComponentType } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IconArrowUpRight } from '@tabler/icons-react';
import { spaceGrotesk } from '@/lib/fonts';

interface CategoryStackCardProps {
  href: string;
  title: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  /** Up to three photos; they sit stacked and fan out on hover. */
  images: Array<{ src: string; alt: string }>;
  stats: string[];
}

// Where each photo of the stack rests, and where it swings to on hover
// (back, middle, front). Kept as full class strings so Tailwind ships them.
const PHOTO_POSITIONS = [
  '-translate-x-[58%] -rotate-6 group-hover:-translate-x-[108%] group-hover:-rotate-12',
  '-translate-x-[42%] rotate-3 group-hover:-translate-x-1/2 group-hover:-translate-y-2 group-hover:rotate-0',
  '-translate-x-1/2 -rotate-2 group-hover:translate-x-[8%] group-hover:rotate-12',
];

// Category card for the home page: a stack of the category's photos that
// fans out when the card is hovered, then its name, a couple of quick facts
// and a short line about it. The whole card links to the category.
const CategoryStackCard = ({
  href,
  title,
  description,
  icon: Icon,
  images,
  stats,
}: CategoryStackCardProps) => {
  return (
    <Link
      href={href}
      data-cursor='Ver'
      className='group flex w-[78vw] max-w-xs shrink-0 snap-center flex-col rounded-3xl border border-default-200 bg-content1 p-4 shadow-sm transition-[translate,box-shadow] duration-500 ease-brand hover:-translate-y-1.5 hover:shadow-xl sm:w-auto sm:max-w-none dark:border-default-100/20'
    >
      <div className='relative h-44 overflow-hidden rounded-2xl bg-primary/10'>
        {images.slice(0, 3).map((image, index) => (
          <div
            key={image.src}
            className={`absolute top-1/2 left-1/2 aspect-4/5 h-[78%] -translate-y-1/2 overflow-hidden rounded-xl shadow-lg ring-2 ring-white transition-transform duration-700 ease-brand dark:ring-default-100 ${PHOTO_POSITIONS[index]}`}
            style={{ zIndex: index + 1 }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes='140px'
              className='object-cover'
            />
          </div>
        ))}
      </div>

      <div className='mt-4 flex items-start justify-between gap-3'>
        <div className='flex items-center gap-2.5'>
          <span className='flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <Icon size={18} />
          </span>
          <h3
            className={`${spaceGrotesk.className} text-lg leading-tight font-bold text-foreground`}
          >
            {title}
          </h3>
        </div>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-full border border-default-200 text-default-500 transition-[rotate,background-color,color,border-color] duration-500 ease-brand group-hover:rotate-45 group-hover:border-primary group-hover:bg-primary group-hover:text-white dark:border-default-100/20'>
          <IconArrowUpRight size={18} />
        </span>
      </div>

      {/* <div className='mt-3 flex flex-wrap gap-1.5'>
        {stats.map((stat) => (
          <span
            key={stat}
            className='rounded-full bg-content2 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-default-600 uppercase'
          >
            {stat}
          </span>
        ))}
      </div> */}

      <p className='mt-3 line-clamp-2 text-sm text-default-500'>
        {description}
      </p>
    </Link>
  );
};

export default CategoryStackCard;
