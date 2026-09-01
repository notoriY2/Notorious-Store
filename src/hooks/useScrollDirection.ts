import { useEffect, useRef, useState, RefObject } from 'react';

export const useScrollDirection = (
  threshold = 4,
  scrollRef?: RefObject<HTMLElement>
) => {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const el = scrollRef?.current;
    const getY = () => (el ? el.scrollTop : window.scrollY);
    const target: HTMLElement | Window = el ?? window;

    lastY.current = getY();

    const onScroll = () => {
      const y = getY();
      const diff = y - lastY.current;

      if (y < 80) {
        setHidden(false);
      } else if (diff > threshold) {
        setHidden(true);
      } else if (diff < -threshold) {
        setHidden(false);
      }

      // Always advance the reference point, even below threshold, so a
      // direction reversal is detected on the very next scroll tick
      // instead of waiting for cumulative distance from a stale point.
      lastY.current = y;
    };

    target.addEventListener('scroll', onScroll, { passive: true } as any);
    return () => target.removeEventListener('scroll', onScroll as any);
  }, [threshold, scrollRef]);

  return hidden;
};