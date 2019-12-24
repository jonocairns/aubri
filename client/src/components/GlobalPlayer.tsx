import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {TimeAction} from '../actions/timeStateAction';
import {
  PAUSE,
  PLAY,
  UPDATE_BUFFERED,
  UPDATE_CURRENT_TIME,
  UPDATE_DURATION,
  UPDATE_SRC,
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

export enum Traverse {
  FORWARD,
  BACKWARD,
}

export const GlobalPlayer = () => {
  const dispatch = useDispatch();
  const {
    fileId,
    playing,
    src,
    currentTime,
    duration,
    title,
    volume,
    queue,
  } = useSelector((state: State) => state.player);
  const times = useSelector((state: State) => state.time);
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

  const traverse = (direction: Traverse, play?: boolean) => {
    console.log('traversing');

    if (
      Math.floor(currentTime) > 0 &&
      direction === Traverse.BACKWARD &&
      playing
    ) {
      audio.currentTime = 0;
      dispatch({type: UPDATE_CURRENT_TIME, currentTime: audio.currentTime});
      return;
    }

    const currentPosition = queue.findIndex(q => q.id === fileId);
    let nextPosition = currentPosition + 1;
    if (direction === Traverse.BACKWARD) {
      nextPosition = currentPosition - 1;
    }

    const next =
      nextPosition <= queue.length - 1 && nextPosition >= 0
        ? nextPosition
        : currentPosition;

    const nextFile = queue[next];

    const url = `http://localhost:6969/api/audio/play/${nextFile.id}`;

    if (currentPosition !== next) {
      const newAudio = new Audio(url);
      newAudio.currentTime = 0;
      setAudio(newAudio);

      dispatch({
        type: UPDATE_SRC,
        src: url,
        fileId: nextFile.id,
        title: nextFile.filename,
      });
      dispatch({type: UPDATE_DURATION, duration: nextFile.duration});
      dispatch({type: UPDATE_CURRENT_TIME, currentTime: audio.currentTime});

      if (play) {
        dispatch({type: PLAY});
      }
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
        traverse(Traverse.FORWARD, true);
        break;

      case 'timeupdate':
        dispatch({type: UPDATE_CURRENT_TIME, currentTime: audio.currentTime});
        dispatch({
          type: UPDATE_TIME,
          payload: {time: audio.currentTime, id: fileId},
        } as TimeAction);
        break;

      case 'loadedmetadata':
        // dispatch({ type: UPDATE_DURATION, duration: audio.duration });
        // fetch time here?
        dispatch({type: UPDATE_CURRENT_TIME, currentTime: audio.currentTime});
        dispatch({
          type: UPDATE_TIME,
          payload: {time: audio.currentTime, id: fileId},
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
  }, [volume, audio.volume]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId]);

  React.useEffect(() => {
    if (playing) {
      audio.src = src;
      let saved = times[fileId];

      if (saved) {
        if (Math.round(saved) === Math.round(duration)) {
          saved = 0;
        }
      } else {
        saved = 0;
      }
      audio.currentTime = saved;
      audio.play();
    } else {
      audio.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, playing]);

  const percent = (Number(currentTime) / duration) * 100;

  React.useEffect(() => {
    if (
      Math.abs(currentTime - lastUpdated) > 2 &&
      currentTime !== 0 &&
      playing
    ) {
      fetch(`http://localhost:6969/api/audio/save/${fileId}/${currentTime}`);
      setLastUpdated(currentTime);
      console.log(`saving time ${currentTime}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime, fileId, playing]);

  const toggle = () => {
    if (playing) {
      dispatch({type: PAUSE});
    } else {
      dispatch({type: PLAY});
    }
  };

  const onClickPercent = (e: React.MouseEvent) => {
    const percentClick = (e.clientX / window.innerWidth) * 100;
    const seek = duration * (percentClick / 100);
    audio.currentTime = seek;
  };

  const getTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    let display = `${mins}:`;
    if (secs < 10) {
      display = `${display}0${secs}`;
    } else {
      display = `${display}${secs}`;
    }
    return display;
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
            {getTime(audio.currentTime)} / {getTime(duration)}
          </div>
        </div>
        <div className="col-6 d-flex justify-content-center">
          <SvgSkipPrevious24Px
            {...iconProps}
            onClick={() => traverse(Traverse.BACKWARD)}
          />

          {playing ? (
            <SvgPauseCircleOutline24Px {...iconProps} onClick={toggle} />
          ) : (
            <SvgPlayCircleOutline24Px {...iconProps} onClick={toggle} />
          )}

          <SvgSkipNext24Px
            {...iconProps}
            onClick={() => traverse(Traverse.FORWARD)}
          />
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
