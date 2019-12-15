import React, { useState, useEffect } from "react";

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

const Player = ({ id }: { id: string}) => {
  const [playing, toggle] = useAudio(`http://localhost:6969/api/audio/play/${id}`);

  return (
    <div>
      {/* <audio
        controls
        src={`http://localhost:6969/api/audio/play/${id}`}>
            Your browser does not support the
            <code>audio</code> element.
    </audio> */}
      <button onClick={toggle as any}>{playing ? "Pause" : "Play"}</button>
    </div>
  );
};

export default Player;