import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {TimeAction} from './actions/timeStateAction';
import {
  PAUSE,
  PLAY,
  UPDATE_DURATION,
  UPDATE_SRC,
  UPDATE_TIME,
} from './constants/actionTypes';
import {SvgPauseCircleOutline24Px} from './icons/PauseCircleOutline24Px';
import {SvgPlayCircleOutline24Px} from './icons/PlayCircleOutline24Px';
import {State} from './State';

interface PlayerProps {
  id: string;
  file: string;
  title: string;
  duration: number;
}

const Player = (props: PlayerProps) => {
  const dispatch = useDispatch();
  const {id, file, src, playing} = useSelector((state: State) => state.player);
  const fileId = props.id + props.file;
  const stateFileId = id + file;
  const time = useSelector(
    (state: State) => props.id && state.times[props.id + props.file]
  ) as number;
  const [isLoading, setLoading] = useState(true);

  const play = async () => {
    const url = `http://localhost:6969/api/audio/play/${props.id}/${props.file}`;

    if (src !== url) {
      dispatch({
        type: UPDATE_SRC,
        src: url,
        id: props.id,
        file: props.file,
        title: props.title,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:6969/api/audio/play/${props.id}/${props.file}/time`
        );
        if (response.status === 200) {
          const d = await response.json();
          dispatch({
            type: UPDATE_TIME,
            payload: {time: d.time, id: fileId},
          } as TimeAction);
        } else {
          dispatch({
            type: UPDATE_TIME,
            payload: {time: 0, id: fileId},
          } as TimeAction);
        }
      } catch (e) {
        console.log(e);
        console.log(`possibly could not find time... returning 0 index`);
        dispatch({
          type: UPDATE_TIME,
          payload: {time: 0, id: fileId},
        } as TimeAction);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  });

  const percent = (Number(time) / (props.duration / 1000)) * 100;

  return isLoading ? null : (
    <div className="list-group-item d-flex justify-content-between align-items-center text-white bg-dark">
      {props.title}
      <div
        className="w-100 px-0 mx-0"
        style={{height: '100%', position: 'absolute', left: 0, top: 0}}
      >
        <div
          className="bg-warning"
          style={{width: `${percent}%`, height: '100%', opacity: 0.1}}
        ></div>
      </div>

      <span
        className="text-white"
        style={{cursor: 'pointer', zIndex: 1}}
        onClick={play}
      >
        {stateFileId === fileId && playing ? (
          <SvgPauseCircleOutline24Px fill="white" height="28px" width="28px" />
        ) : (
          <SvgPlayCircleOutline24Px fill="white" height="28px" width="28px" />
        )}
      </span>
    </div>
  );
};

export default Player;