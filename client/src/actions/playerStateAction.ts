import {
  PAUSE,
  PLAY,
  UPDATE_BUFFERED,
  UPDATE_CURRENT_TIME,
  UPDATE_DURATION,
  UPDATE_SRC,
  UPDATE_VOLUME,
} from '../constants/actionTypes';

export interface PlayerAction {
  type: typeof PLAY | typeof PAUSE;
}

export interface UpdateBuffered {
  type: typeof UPDATE_BUFFERED;
  buffered: number;
}

export interface UpdateDuration {
  type: typeof UPDATE_DURATION;
  duration: number;
}

export interface UpdateTimeAction {
  type: typeof UPDATE_CURRENT_TIME;
  currentTime: number;
}

export interface UpdateVolumeAction {
  type: typeof UPDATE_VOLUME;
  volume: number;
}

export interface UpdateSrcAction {
  type: typeof UPDATE_SRC;
  src: string;
  id: string;
  file: string;
  title: string;
}

export type PlayerActionTypes =
  | PlayerAction
  | UpdateTimeAction
  | UpdateBuffered
  | UpdateDuration
  | UpdateSrcAction
  | UpdateVolumeAction;
