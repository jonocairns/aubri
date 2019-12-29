import {useCallback, useEffect, useRef, useState} from 'react';

export const useInterval = (callback: any, delay: any) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      (savedCallback as any).current();
    }

    if (delay) {
      const id = setInterval(() => {
        tick();
      }, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export const useWindowSize = () => {
  const validWindow = typeof window === 'object';

  const getSize = useCallback(() => {
    const size = {
      width: validWindow ? window.innerWidth : undefined,
      height: validWindow ? window.innerHeight : undefined,
    };

    return size;
  }, [validWindow]);

  const [size, setSize] = useState(getSize());

  useEffect(() => {
    function handleResize() {
      setSize(getSize());
    }

    if (validWindow) {
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [getSize, validWindow]);

  return size;
};
