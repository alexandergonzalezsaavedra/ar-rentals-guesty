import type { ReactNode } from 'react';
import { IconArrowRight } from '@tabler/icons-react';

// Button label with a leading dot that trades places with an arrow on hover:
// the dot shrinks away, the text slides into its spot and the arrow comes in
// behind it. The parent button must have the `group` class.
const DotArrowLabel = ({ children }: { children: ReactNode }) => {
  return (
    <span className='inline-flex items-center gap-3'>
      <span className='size-2 shrink-0 rounded-full bg-current transition-transform duration-500 ease-brand group-hover:scale-0' />
      <span className='transition-transform duration-500 ease-brand group-hover:-translate-x-5'>{children}</span>
      {/* The negative margin cancels the arrow's footprint, so the label is centered while it's hidden. */}
      <IconArrowRight
        size={18}
        className='-mr-[30px] shrink-0 -translate-x-8 opacity-0 transition-[transform,opacity] duration-500 ease-brand group-hover:-translate-x-5 group-hover:opacity-100'
      />
    </span>
  );
};

export default DotArrowLabel;
