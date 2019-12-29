import {useEffect, useRef, useState} from 'react';

import {useInterval, useWindowSize} from './useInterval';

const WINDOW = 'window';
const PARENT = 'parent';

export const useInfiniteScroll = ({
  loading,
  hasNextPage,
  onLoadMore,
  threshold = 150,
  checkInterval = 200,
  scrollContainer = WINDOW,
}: any) => {
  const ref = useRef();
  const {height: windowHeight, width: windowWidth} = useWindowSize();
  const [listen, setListen] = useState(true);

  useEffect(() => {
    if (!loading) {
      setListen(true);
    }
  }, [loading]);

  const getParentSizes = () => {
    const parentNode = (ref?.current as any).parentNode;
    const parentRect = parentNode.getBoundingClientRect();
    const {top, bottom, left, right} = parentRect;

    return {top, bottom, left, right};
  };

  const getBottomOffset = () => {
    const rect = (ref?.current as any).getBoundingClientRect();

    const bottom = rect.bottom;
    let bottomOffset = bottom - (windowHeight || 0);

    if (scrollContainer === PARENT) {
      const {bottom: parentBottom} = getParentSizes();
      // Distance between bottom of list and its parent
      bottomOffset = bottom - parentBottom;
    }

    return bottomOffset;
  };

  const isParentInView = () => {
    const parent = ref.current ? (ref?.current as any).parentNode : null;

    if (parent) {
      const {left, right, top, bottom} = getParentSizes();
      if (left > (windowWidth || 0)) {
        return false;
      } else if (right < 0) {
        return false;
      } else if (top > (windowHeight || 0)) {
        return false;
      } else if (bottom < 0) {
        return false;
      }
    }

    return true;
  };

  const listenBottomOffset = () => {
    if (listen && !loading && hasNextPage) {
      if (ref.current) {
        if (scrollContainer === PARENT) {
          if (!isParentInView()) {
            // Do nothing if the parent is out of screen
            return;
          }
        }

        // Check if the distance between bottom of the container and bottom of the window or parent
        // is less than "threshold"
        const bottomOffset = getBottomOffset();
        const validOffset = bottomOffset < threshold;

        console.log(`bottomoffset ${bottomOffset} and threashold ${threshold}`);

        if (validOffset) {
          onLoadMore();
        }
      }
    }
  };

  useInterval(
    () => {
      listenBottomOffset();
    },
    // Stop interval when there is no next page.
    checkInterval
  );

  return ref;
};
