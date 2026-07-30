'use client';

import { useEffect, useState } from 'react';

// Must mirror the `bottom-24`/`md:bottom-5` + `h-14` offsets on the floating
// buttons — used to detect when the footer would creep into a button's resting
// footprint so it can be lifted clear instead of covering the footer
// links/copyright.
const MOBILE_CLEARANCE = 96 + 56;
const DESKTOP_CLEARANCE = 20 + 56;
const MD_BREAKPOINT = 768;
const GAP = 16;

/**
 * Distance in px to lift a bottom-anchored floating button so it clears the
 * footer. Recomputes on scroll and resize, and — via ResizeObserver — whenever
 * the document's height changes.
 *
 * That last trigger is what keeps the button anchored: a route that swaps a
 * short loading state for taller content moves the footer without firing
 * either event, so a scroll/resize-only measurement stays stuck at the value
 * it took while the page was still short and leaves the button mid-viewport.
 */
export function useFooterLift() {
  const [lift, setLift] = useState(0);

  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;

    let raf = 0;
    const recalc = () => {
      raf = 0;
      const overlap = window.innerHeight - footer.getBoundingClientRect().top;
      const clearance = window.innerWidth >= MD_BREAKPOINT ? DESKTOP_CLEARANCE : MOBILE_CLEARANCE;
      setLift(Math.max(0, overlap - clearance + GAP));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(recalc);
    };

    recalc();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    // The buttons move via `transform`, which doesn't affect layout, so
    // reacting to body resizes can't feed back into itself here.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);

    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return lift;
}
