import React, { useState, useEffect } from "react";
import { SvgPauseCircleOutline24Px } from './icons/PauseCircleOutline24Px';
import { SvgPlayCircleOutline24Px } from './icons/PlayCircleOutline24Px';
import { useDispatch, useSelector } from 'react-redux';
import { PlayerAction } from './actions/playerStateAction';
import { PLAY, UPDATE_TIME } from './constants/actionTypes';
import { State } from './State';
import { TimeAction } from './actions/timeStateAction';

interface PlayerProps {
  id: string, file: string, title: string, duration: number
}

const Player = (props: PlayerProps) => {
  const dispatch = useDispatch();
  let { audio, id, file, isPlaying } = useSelector((state: State) => state.player);
  const fileId = props.id + props.file;
  const stateFileId = id + file;
  const time = useSelector((state: State) => props.id && state.times[props.id + props.file]) as number;
  const [isLoading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:6969/api/audio/play/${props.id}/${props.file}/time`);
      const d = await response.json();
      dispatch({ type: UPDATE_TIME, payload: { time: d.time, id: fileId } } as TimeAction);
    } catch (e) {
      console.log(e);
      console.log(`possibly could not find time... returning 0 index`)
      dispatch({ type: UPDATE_TIME, payload: { time: 0, id: fileId } } as TimeAction);
    } finally {
      setLoading(false);
    }
  }

  const play = async () => {
    const url = `http://localhost:6969/api/audio/play/${props.id}/${props.file}`;

    if (stateFileId === fileId && isPlaying && audio) {
      audio.pause();

      audio.src = '';
    } else {
      if (!audio) {
        audio = new Audio(url);
      } else {
        audio.src = '';
        audio.src = url;
      }
      audio.currentTime = time;
      audio.play();
    }

    dispatch({ type: PLAY, payload: { currentTime: audio && audio.currentTime, isPlaying: !isPlaying, id: props.id, file: props.file, totalTime: props.duration, audio, title: props.title } } as PlayerAction);
  };

  useEffect(() => {
    fetchData();
  }, [])

  const percent = (Number(time)) / (props.duration / 1000) * 100;

  return (
    isLoading ? null : <div className="list-group-item d-flex justify-content-between align-items-center text-white bg-dark">
      {props.title}
      <div className="w-100 px-0 mx-0" style={{ height: '100%', position: 'absolute', left: 0, top: 0 }}>
        <div className="bg-warning" style={{ width: `${percent}%`, height: '100%', opacity: 0.1 }}></div>
      </div>

      <span className="text-white" style={{ cursor: 'pointer', zIndex: 1 }} onClick={play as any}>{stateFileId === fileId && isPlaying ?
        <SvgPauseCircleOutline24Px fill="white" height="28px" width="28px" /> :
        <SvgPlayCircleOutline24Px fill="white" height="28px" width="28px" />}</span>
    </div>
  );
};

export default Player;