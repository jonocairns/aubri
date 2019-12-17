import React, { useState, useEffect } from "react";
import { SvgPauseCircleOutline24Px } from './icons/PauseCircleOutline24Px';
import { SvgPlayCircleOutline24Px } from './icons/PlayCircleOutline24Px';

const useAudio = (url: string) => {
  const [audio, setAudio] = useState<undefined | HTMLAudioElement>(undefined);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (audio === undefined) {
      setAudio(new Audio(url));
    }
    setPlaying(!playing)
  };

  useEffect(() => {
    playing ? audio && audio.play() : audio && audio.pause();
  },
    [playing]
  );

  useEffect(() => {
    audio && audio.addEventListener('ended', () => setPlaying(false));
    return () => {
      if(audio) {
        audio.pause();
        audio.removeAttribute('src');
        audio.removeEventListener('ended', () => setPlaying(false));
        audio.load();
      }
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