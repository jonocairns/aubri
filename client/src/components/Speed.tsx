import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {UPDATE_SPEED} from '../constants/actionTypes';
import {State} from '../State';
import {iconProps} from './GlobalPlayer';
import {SvgSpeed24Px} from '../icons/Speed24Px';
import {SvgAdd24Px} from '../icons/Add24Px';
import {SvgRemove24Px} from '../icons/Remove24Px';

export const Speed: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const speed = useSelector((state: State) => state.player.speed);
  const ref = useRef<HTMLDivElement | null>(null);
  const toggle = () => setIsOpen(!isOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const updateSpeed = (speed: number) => dispatch({type: UPDATE_SPEED, speed});

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return (
    <div ref={ref} className="d-flex flex-row position-relative">
      {isOpen && (
        <div
          className="position-absolute bg-secondary py-2"
          style={{left: 0, top: -120}}
        >
          <div className="list-group d-flex flex-column align-items-center justify-content-center">
            <SvgAdd24Px
              {...iconProps}
              onClick={() => updateSpeed(speed + 0.1)}
            />
            <div className="p-2">
              <b>{speed.toFixed(1)}</b>
            </div>
            <SvgRemove24Px
              {...iconProps}
              onClick={() => updateSpeed(speed - 0.1)}
            />
          </div>
        </div>
      )}
      <SvgSpeed24Px {...iconProps} onClick={toggle} />
    </div>
  );
};
