import {Audiobook, File} from '../../server/src/core/schema';

export interface PlayerState {
  fileId: string;
  playing: boolean;
  buffered: number;
  currentTime: number;
  duration: number;
  src: string;
  title: string;
  volume: number;
  queue: Array<File>;
}

export interface BookState {
  books: Array<{book: Audiobook; files: Array<string>}>;
}

export interface TimeState {
  [key: string]: number;
}

export interface State {
  player: PlayerState;
  time: TimeState;
  books: BookState;
}
