import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {PlayerAction} from '../actions/playerStateAction';
import {TimeAction} from '../actions/timeStateAction';
import {
  PAUSE,
  PLAY,
  UPDATE_BUFFERED,
  UPDATE_CURRENT_TIME,
  UPDATE_TIME,
} from '../constants/actionTypes';
import {SvgPauseCircleOutline24Px} from '../icons/PauseCircleOutline24Px';
import {SvgPlayCircleOutline24Px} from '../icons/PlayCircleOutline24Px';
import {SvgSkipNext24Px} from '../icons/SkipNext24Px';
import {SvgSkipPrevious24Px} from '../icons/SkipPrevious24Px';
import {State} from '../State';
import {Volume} from './Volume';

const audioEvents = [
  'error',
  'progress',
  'play',
  'pause',
  'ended',
  'timeupdate',
  'loadedmetadata',
  'loadstart',
];

export const iconProps = {
  fill: 'white',
  fontSize: '32px',
  className: 'mx-2',
  style: {cursor: 'pointer'},
};

export const GlobalPlayer = () => {
  const dispatch = useDispatch();
  const {
    id,
    file,
    playing,
    src,
    currentTime,
    duration,
    title,
    volume,
  } = useSelector((state: State) => state.player);
  const times = useSelector((state: State) => state.times);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [audio, setAudio] = useState(new Audio());

  const updateProgress = () => {
    const range = audio.buffered;
    if (range.length > 0) {
      dispatch({
        type: UPDATE_BUFFERED,
        buffered: range.end(range.length - 1),
      });
    }
  };

  const handlePlayerEvent = (evt: Event) => {
    switch (evt.type) {
      case 'error':
        // NowPlayingActions.setError(evt.srcElement.error);
        console.log('Error received from Audio component:');
        console.error(evt);
        break;

      case 'progress':
        updateProgress();
        break;

      case 'play':
        if (!playing) {
          dispatch({type: PLAY});
        }
        break;

      case 'pause':
        if (playing) {
          dispatch({type: PAUSE});
        }
        break;

      case 'ended':
        // NowPlayingActions.ended(NowPlayingStore.getSource(), NowPlayingStore.getRepeat());
        break;

      case 'timeupdate':
        dispatch({type: UPDATE_CURRENT_TIME, currentTime: audio.currentTime});
        dispatch({
          type: UPDATE_TIME,
          payload: {time: audio.currentTime, id: id + file},
        } as TimeAction);
        break;

      case 'loadedmetadata':
        // dispatch({ type: UPDATE_DURATION, duration: audio.duration });
        // fetch time here?
        dispatch({type: UPDATE_CURRENT_TIME, currentTime: audio.currentTime});
        dispatch({
          type: UPDATE_TIME,
          payload: {time: audio.currentTime, id: id + file},
        } as TimeAction);
        if (playing) {
          audio.play();
        }
        break;

      case 'loadstart':
        // NowPlayingActions.reset();
        break;

      default:
        console.warn('unhandled player event:');
        console.warn(evt);
        break;
    }
  };

  React.useEffect(() => {
    console.log('updating volume...');
    audio.volume = volume;
  }, [volume]);

  React.useEffect(() => {
    for (const e of audioEvents) {
      audio.addEventListener(e, handlePlayerEvent);
    }

    return () => {
      audio.pause();
      for (const e of audioEvents) {
        audio.removeEventListener(e, handlePlayerEvent);
      }
      audio.src = '';
    };
  }, [id, file]);

  React.useEffect(() => {
    if (playing) {
      audio.src = src;
      audio.currentTime = times[id + file] || 0;
      audio.play();
    } else {
      audio.pause();
    }
  }, [src, playing]);

  const percent = (Number(currentTime) / (duration / 1000)) * 100;

  React.useEffect(() => {
    if (
      Math.abs(currentTime - lastUpdated) > 2 &&
      currentTime !== 0 &&
      playing
    ) {
      fetch(
        `http://localhost:6969/api/audio/save/${id}/${file}/${currentTime}`
      );
      setLastUpdated(currentTime);
      console.log(`saving time ${currentTime}`);
    }
  }, [currentTime, id, file, playing]);

  const toggle = () => {
    if (playing) {
      dispatch({type: PAUSE});
    } else {
      dispatch({type: PLAY});
    }
  };

  const onClickPercent = (e: React.MouseEvent) => {
    const percentClick = (e.clientX / window.innerWidth) * 100;
    const seek = (duration / 1000) * (percentClick / 100);
    audio.currentTime = seek;
  };

  return title ? (
    <div className="fixed-bottom bg-dark" style={{opacity: 0.8}}>
      {isFinite(percent) && (
        <div
          className="w-100 px-0 mx-0 pb-3"
          onClick={onClickPercent}
          style={{height: '3px', cursor: 'pointer'}}
        >
          <div
            className="bg-warning"
            style={{width: `${percent}%`, height: '3px', opacity: 0.5}}
          ></div>
        </div>
      )}
      <div className="d-flex p-3 text-white">
        <div className="col-3">
          <div>{title}</div>
          <div>
            {currentTime} / {duration}
          </div>
        </div>
        <div className="col-6 d-flex justify-content-center">
          <SvgSkipPrevious24Px {...iconProps} />

          {playing ? (
            <SvgPauseCircleOutline24Px {...iconProps} onClick={toggle} />
          ) : (
            <SvgPlayCircleOutline24Px {...iconProps} onClick={toggle} />
          )}

          <SvgSkipNext24Px {...iconProps} />
        </div>
        <div className="col-3">
          <div className="d-flex justify-content-end">
            <Volume />
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
