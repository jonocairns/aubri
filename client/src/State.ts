export interface PlayerState {
  id: string;
  file: string;
  playing: boolean;
  buffered: number;
  currentTime: number;
  duration: number;
  src: string;
  title: string;
  volume: number;
}

export interface TimeState {
  [key: string]: number;
}

export interface State {
  player: PlayerState;
  times: TimeState;
}
