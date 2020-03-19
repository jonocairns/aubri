import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {File} from '../../server/src/core/schema';
import {
  PAUSE,
  PLAY,
  UPDATE_DURATION,
  UPDATE_QUEUE,
  UPDATE_SRC,
} from './constants/actionTypes';
import {SvgPauseCircleOutline24Px} from './icons/PauseCircleOutline24Px';
import {SvgPlayCircleOutline24Px} from './icons/PlayCircleOutline24Px';
import {settings} from './index';
import {State} from './State';

interface PlayerProps {
  localUrl: string | undefined;
  fileId: string;
  title: string;
  duration: number;
  queue: Array<File>;
}

export const fillTheme = '#1FFFC5';

const Player = (props: PlayerProps) => {
  const dispatch = useDispatch();
  const {fileId, src, playing} = useSelector((state: State) => state.player);

  const time = useSelector(
    (state: State) => state.time[props.fileId] || 0
  ) as number;

  const play = async () => {
    let url = props.localUrl;
    if (!url) {
      console.log('could not find local... streaming audio');

      url = `${settings.baseUrl}api/audio/play/${props.fileId}`;
    } else {
      console.log('no need to stream, playing from local...');
    }

    if (src !== url) {
      dispatch({
        type: UPDATE_SRC,
        src: url,
        fileId: props.fileId,
        title: props.title,
      });
      dispatch({
        type: UPDATE_QUEUE,
        queue: props.queue,
      });
      dispatch({type: UPDATE_DURATION, duration: props.duration});
      dispatch({type: PLAY});
    } else {
      if (playing) {
        dispatch({type: PAUSE});
      } else {
        dispatch({type: PLAY});
      }
    }
  };

  const percent = (Number(time) / props.duration) * 100;

  return (
    <div className="list-group-item d-flex justify-content-between align-items-center text-white bg-dark">
      {props.title}
      <div
        className="w-100 px-0 mx-0"
        style={{height: '100%', position: 'absolute', left: 0, top: 0}}
      >
        <div
          className="theme-color-bg"
          style={{width: `${percent}%`, height: '100%', opacity: 0.1}}
        ></div>
      </div>

      <div style={{zIndex: 1}}>
        <span className="text-white" style={{cursor: 'pointer'}} onClick={play}>
          {props.fileId === fileId && playing ? (
            <SvgPauseCircleOutline24Px
              fill={fillTheme}
              height="28px"
              width="28px"
            />
          ) : (
            <SvgPlayCircleOutline24Px fill="white" height="28px" width="28px" />
          )}
        </span>
      </div>
    </div>
  );
};

export default Player;
