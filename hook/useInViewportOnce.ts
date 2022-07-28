import { useInViewport } from 'ahooks';
import { useRef, useEffect } from 'react';

export const useInViewportOnce = (...arg: Parameters<typeof useInViewport>) => {
  const [inViewport] = useInViewport(...arg);
  const flag = useRef(false);

  useEffect(() => {
    if (inViewport) {
      flag.current = true;
    }
  }, [inViewport]);

  if (flag.current) {
    return [true] as const;
  }

  return [inViewport];
};
