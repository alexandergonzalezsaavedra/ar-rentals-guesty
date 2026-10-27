'use client';

import type { ReactNode } from 'react';
import { Accordion, AccordionItem } from '@heroui/react';

export interface LegalItem {
  title: string;
  /** Paragraphs separated by blank lines; lines starting with "• " render as a list. */
  body: string;
  /** Already rendered (e.g. <IconClock size={18} />): server pages can't pass components to this client one. */
  icon: ReactNode;
}

// Expandable list of legal clauses (several can be open at once).
const LegalAccordion = ({ items }: { items: LegalItem[] }) => (
  <Accordion
    variant='splitted'
    selectionMode='multiple'
    className='px-0'
  >
    {items.map(({ title, body, icon }) => (
      <AccordionItem
        key={title}
        aria-label={title}
        startContent={
          <span className='flex size-9 items-center justify-center rounded-full bg-sierra text-white dark:bg-secondary'>
            {icon}
          </span>
        }
        title={<span className='font-semibold text-foreground'>{title}</span>}
        classNames={{ base: 'shadow-sm border border-default-200 dark:border-default-100/20' }}
      >
        <div className='flex flex-col gap-3 pb-2 text-sm leading-relaxed text-default-600'>
          {body.split('\n\n').map((paragraph) => (
            <p
              key={paragraph.slice(0, 40)}
              className='whitespace-pre-line'
            >
              {paragraph}
            </p>
          ))}
        </div>
      </AccordionItem>
    ))}
  </Accordion>
);

export default LegalAccordion;
