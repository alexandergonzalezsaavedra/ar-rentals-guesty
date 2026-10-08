// Shared plumbing between the property page's section slider and the things
// that navigate it or react to it (side nav, mobile nav).

/** Fired on `window` with the active section id as `detail` whenever the section in focus changes. */
export const PROPERTY_SECTION_EVENT = 'property-section-change';

export const HERO_SECTION_ID = 'property-hero';

/**
 * Scrolls the page to a section. Sections are slides of a stage that stays
 * pinned while the page scrolls, so "going to" one means scrolling to the
 * point of that scroll range where its slide is the one at rest. The slider
 * publishes that point on each slide as `data-slide-start`.
 */
export function scrollToPropertySection(id: string) {
  if (id === HERO_SECTION_ID) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const slide = document.querySelector<HTMLElement>(`[data-slide-nav="${id}"]`);
  const slider = slide?.closest<HTMLElement>('[data-sections-slider]');
  const stage = slider?.querySelector<HTMLElement>('[data-sections-stage]');

  if (!slide || !slider || !stage) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const stickyTop = parseFloat(getComputedStyle(stage).top) || 0;
  const sliderTop = slider.getBoundingClientRect().top + window.scrollY;

  window.scrollTo({
    top: sliderTop - stickyTop + Number(slide.dataset.slideStart ?? 0),
    behavior: 'smooth',
  });
}
