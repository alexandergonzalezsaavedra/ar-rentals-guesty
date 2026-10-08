// The two motion curves of the site. Everything that moves should use one of
// them, so the whole thing feels like one piece. The same values are exposed
// to CSS as `--ease-brand` / `--ease-brand-soft` (Tailwind: `ease-brand`,
// `ease-brand-soft`) in app/globals.css — keep both in sync.

type BezierPoints = [number, number, number, number];

/** Decisive: quick off the mark, long settle. For entrances, reveals and hovers. */
export const EASE_BRAND: BezierPoints = [0.35, 0, 0, 1];

/** Gentler on both ends. For things that travel across the screen or cross-fade. */
export const EASE_BRAND_SOFT: BezierPoints = [0.4, 0, 0.1, 1];

/**
 * Turns cubic-bezier control points into an easing function (0..1 → 0..1),
 * for animations driven from JavaScript instead of CSS.
 */
export function cubicBezier([x1, y1, x2, y2]: BezierPoints): (progress: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;

  return (progress: number) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;

    // The curve is parametric: find the t whose x matches `progress` by
    // bisection (always converges, unlike Newton on these steep curves).
    let low = 0;
    let high = 1;
    let t = progress;

    for (let i = 0; i < 20; i++) {
      const x = sampleX(t);

      if (Math.abs(x - progress) < 1e-5) break;

      if (x < progress) {
        low = t;
      } else {
        high = t;
      }

      t = (low + high) / 2;
    }

    return sampleY(t);
  };
}
