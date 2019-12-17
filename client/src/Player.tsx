import React, { useState, useEffect } from "react";
import { SvgPauseCircleOutline24Px } from './icons/PauseCircleOutline24Px';
import { SvgPlayCircleOutline24Px } from './icons/PlayCircleOutline24Px';

interface Props { id: string, file: string, name: string, duration: number, time: number, setTime: any };

const useAudio = ({ id, file, setTime, time }: Props) => {
  const [audio, setAudio] = useState<undefined | HTMLAudioElement>(undefined);
  const [playing, setPlaying] = useState(false);
  const url = `http://localhost:6969/api/audio/play/${id}/${file}`;



  const toggle = () => {
    if (audio === undefined) {
      const audio = new Audio(url);
      console.log(`starting from ${time}`)
      audio.currentTime = time;
      setAudio(audio);
    }
    setPlaying(!playing)
  };

  useEffect(() => {
    playing ? audio && audio.play() : audio && audio.pause();
  },
    [playing, audio]
  );

  useEffect(() => {
    if (audio) {
      setInterval(async () => {
        await fetch(`http://localhost:6969/api/audio/save/${id}/${file}/${audio.currentTime}`);
        setTime(audio.currentTime);
      }, 1000);
      audio.addEventListener('ended', () => setPlaying(false));
    }
    return () => {
      if (audio) {
        audio.removeEventListener('ended', () => setPlaying(false));
        audio.pause();
        audio.removeAttribute('src');
        audio.load();
      }
    };
  }, [audio]);

  return [playing, toggle];
};

interface PlayerProps {
  id: string, file: string, name: string, duration: number
}

const Player = (props: PlayerProps) => {
  const [time, setTime] = useState(0);
  const [playing, toggle] = useAudio({...props, time, setTime});
  const [isLoading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:6969/api/audio/play/${props.id}/${props.file}/time`);
      const d = await response.json();
      setTime(d.bytes);
    } catch (e) {
      console.log(e);
      console.log(`possibly could not find time... returning 0 index`)
      setTime(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [])

  const percent = Math.floor((Number(time)) / (props.duration / 1000) * 100);

  return (
    isLoading ? null : <div className="list-group-item d-flex justify-content-between align-items-center text-white bg-dark">
      {props.name}
      <div className="w-100 px-0 mx-0" style={{ height: '100%', position: 'absolute', left: 0, top: 0 }}><div className="bg-warning" style={{ width: `${percent}%`, height: '100%', opacity: 0.1 }}></div></div>

      <span className="text-white" style={{ cursor: 'pointer', zIndex: 1 }} onClick={toggle as any}>{playing ?
        <SvgPauseCircleOutline24Px fill="white" height="28px" width="28px" /> :
        <SvgPlayCircleOutline24Px fill="white" height="28px" width="28px" />}</span>
    </div>
  );
};

export default Player;