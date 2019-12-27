import React from 'react';

import {SvgStar24Px} from '../icons/Star24Px';
import {SvgStarBorder24Px} from '../icons/StarBorder24Px';
import {SvgStarHalf24Px} from '../icons/StarHalf24Px';

interface Props {
  stars: number;
}

const iconProps = {
  style: {fill: 'white'},
};

const getArray = (count: number) => Array.from(Array(count).keys());

export const Stars: React.FC<Props> = ({stars}) => {
  const wholeStars = getArray(Math.floor(stars)).map(() => (
    <SvgStar24Px {...iconProps} />
  ));
  const emptyStars = getArray(Math.floor(5 - stars)).map(() => (
    <SvgStarBorder24Px {...iconProps} />
  ));
  const hasPartial = stars % 1 > 0;
  const halfStars = getArray(stars % 1 >= 0.5 ? 1 : 0).map(() => (
    <SvgStarHalf24Px {...iconProps} />
  ));
  if (hasPartial && halfStars.length === 0) {
    emptyStars.push(<SvgStarBorder24Px {...iconProps} />);
  }

  return (
    <>
      {wholeStars}
      {halfStars}
      {emptyStars}
    </>
  );
};
