'use client';

import type { ReactNode } from 'react';
import { Breadcrumbs, BreadcrumbItem } from '@heroui/react';
import { IconHome } from '@tabler/icons-react';

export interface BreadcrumbEntry {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface PageBreadcrumbsProps {
  items: BreadcrumbEntry[];
}

const PageBreadcrumbs = ({ items }: PageBreadcrumbsProps) => {
  return (
    <div className='sticky top-16 z-40 bg-slate-100 px-4 py-0.5 dark:bg-black'>
      <Breadcrumbs
        className='w-full'
        classNames={{ list: 'flex-nowrap overflow-hidden' }}
      >
        <BreadcrumbItem
          href='/'
          className='shrink-0'
        >
          <span className='flex items-center gap-1 text-[11px]'>
            <IconHome size={12} />
            Inicio
          </span>
        </BreadcrumbItem>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <BreadcrumbItem
              key={`${item.label}-${index}`}
              href={item.href}
              className={isLast ? 'min-w-0' : 'shrink-0'}
            >
              <span className='flex min-w-0 items-center gap-1 text-[11px]'>
                {item.icon}
                <span className={isLast ? 'truncate' : ''}>{item.label}</span>
              </span>
            </BreadcrumbItem>
          );
        })}
      </Breadcrumbs>
    </div>
  );
};

export default PageBreadcrumbs;
