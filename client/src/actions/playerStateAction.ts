import {File} from '../../../server/src/core/schema';
import {
  PAUSE,
  PLAY,
  UPDATE_BUFFERED,
  UPDATE_CURRENT_TIME,
  UPDATE_DURATION,
  UPDATE_QUEUE,
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

export interface UpdateQueueAction {
  type: typeof UPDATE_QUEUE;
  queue: Array<File>;
}

export interface UpdateSrcAction {
  type: typeof UPDATE_SRC;
  src: string;
  fileId: string;
  title: string;
}

export type PlayerActionTypes =
  | PlayerAction
  | UpdateTimeAction
  | UpdateBuffered
  | UpdateDuration
  | UpdateSrcAction
  | UpdateVolumeAction
  | UpdateQueueAction;
