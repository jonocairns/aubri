import React, { useState, useEffect } from "react";
import { SvgPauseCircleOutline24Px } from './icons/PauseCircleOutline24Px';
import { SvgPlayCircleOutline24Px } from './icons/PlayCircleOutline24Px';

const useAudio = (url: string) => {
  const [audio] = useState(new Audio(url));
  const [playing, setPlaying] = useState(false);

  const toggle = () => setPlaying(!playing);

  useEffect(() => {
    playing ? audio.play() : audio.pause();
  },
    [playing]
  );

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio.removeEventListener('ended', () => setPlaying(false));
    };
  }, []);

  return [playing, toggle];
};

const Player = ({ id, file }: { id: string, file: string }) => {
  const [playing, toggle] = useAudio(`http://localhost:6969/api/audio/play/${id}/${file}`);

  return (
    <div>
      {/* <audio
        controls
        src={`http://localhost:6969/api/audio/play/${id}`}>
            Your browser does not support the
            <code>audio</code> element.
    </audio> */}
      <span className="text-white" style={{ cursor: 'pointer' }} onClick={toggle as any}>{playing ?
        <SvgPauseCircleOutline24Px fill="white" height="28px" width="28px" /> :
        <SvgPlayCircleOutline24Px fill="white" height="28px" width="28px" />}</span>
    </div>
  );
};

export default Player;