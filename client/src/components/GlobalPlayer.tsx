import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {TimeAction} from '../actions/timeStateAction';
import {useAuth0} from '../Auth';
import {
  PAUSE,
  PLAY,
  UPDATE_BUFFERED,
  UPDATE_CURRENT_TIME,
  UPDATE_DURATION,
  UPDATE_SRC,
} from '../constants/actionTypes';
import {get} from '../db';
import {SvgForward3024Px} from '../icons/Forward3024Px';
import {SvgPauseCircleOutline24Px} from '../icons/PauseCircleOutline24Px';
import {SvgPlayCircleOutline24Px} from '../icons/PlayCircleOutline24Px';
import {SvgReplay3024Px} from '../icons/Replay3024Px';
import {SvgSkipNext24Px} from '../icons/SkipNext24Px';
import {SvgSkipPrevious24Px} from '../icons/SkipPrevious24Px';
import {settings} from '../index';
import {State} from '../State';
import {Speed} from './Speed';
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
    speed,
  } = useSelector((state: State) => state.player);
  const times = useSelector((state: State) => state.time);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [audio, setAudio] = useState(new Audio());
  const {fetchAuthenticated} = useAuth0();

  const updateProgress = () => {
    const range = audio.buffered;
    if (range.length > 0) {
      dispatch({
        type: UPDATE_BUFFERED,
        buffered: range.end(range.length - 1),
      });
    }
  };

  const traverse = async (direction: Traverse, play?: boolean) => {
    console.log('traversing');

    if (
      Math.floor(currentTime) > 0 &&
      direction === Traverse.BACKWARD &&
      playing
    ) {
      audio.currentTime = 0;
      dispatch({
        type: UPDATE_CURRENT_TIME,
        payload: {time: audio.currentTime, id: fileId},
      });
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

    const url =
      (await get(nextFile.id)) ??
      `${settings.baseUrl}api/audio/play/${nextFile.id}`;

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
      dispatch({
        type: UPDATE_CURRENT_TIME,
        payload: {time: audio.currentTime, id: fileId},
      });

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
        // if (!playing) {
        //   dispatch({type: PLAY});
        // }
        break;

      case 'pause':
        // if (playing) {
        //   dispatch({type: PAUSE});
        // }
        break;

      case 'ended':
        traverse(Traverse.FORWARD, true);
        break;

      case 'timeupdate':
        dispatch({
          type: UPDATE_CURRENT_TIME,
          payload: {time: audio.currentTime, id: fileId},
        } as TimeAction);
        break;

      case 'loadedmetadata':
        // dispatch({ type: UPDATE_DURATION, duration: audio.duration });
        // fetch time here?
        dispatch({
          type: UPDATE_CURRENT_TIME,
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
      fetchAuthenticated(
        `${settings.baseUrl}api/audio/save/${fileId}/${currentTime}`
      );
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

  React.useEffect(() => {
    audio.playbackRate = speed;
  }, [speed, audio]);

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

  const seek = (time: number) => {
    const timeToSeekTo = audio.currentTime + time;

    if (timeToSeekTo >= 0 && timeToSeekTo < duration) {
      audio.currentTime = audio.currentTime + time;
    } else if (timeToSeekTo <= 0) {
      audio.currentTime = 0;
    } else if (timeToSeekTo >= duration) {
      audio.currentTime = duration;
    }
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
            className="theme-color-bg"
            style={{width: `${percent}%`, height: '3px', opacity: 0.5}}
          ></div>
        </div>
      )}
      <div className="d-flex p-3 text-white flex-wrap">
        <div className="col-12 col-md-3 d-flex justify-content-center flex-column">
          <div className="text-truncate text-center text-md-left">{title}</div>

          <div className="text-center text-md-left">
            {getTime(audio.currentTime)} / {getTime(duration)}
          </div>
        </div>
        <div className="col-12 col-md-6 d-flex justify-content-center mt-2 mt-md-0">
          <div className="d-md-none">
            <Speed />
          </div>
          <SvgSkipPrevious24Px
            {...iconProps}
            onClick={() => traverse(Traverse.BACKWARD)}
          />

          <SvgReplay3024Px {...iconProps} onClick={() => seek(-30)} />

          {playing ? (
            <SvgPauseCircleOutline24Px {...iconProps} onClick={toggle} />
          ) : (
            <SvgPlayCircleOutline24Px {...iconProps} onClick={toggle} />
          )}

          <SvgForward3024Px {...iconProps} onClick={() => seek(30)} />

          <SvgSkipNext24Px
            {...iconProps}
            onClick={() => traverse(Traverse.FORWARD)}
          />

          <div className="d-md-none align-self-end">
            <Volume />
          </div>
        </div>
        <div className="d-none d-md-block col-md-3">
          <div className="d-flex justify-content-end">
            <Speed />
            <Volume />
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
