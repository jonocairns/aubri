import {File} from '../../../server/src/core/schema';
import {
  PAUSE,
  PLAY,
  UPDATE_BUFFERED,
  UPDATE_DURATION,
  UPDATE_QUEUE,
  UPDATE_SPEED,
  UPDATE_SRC,
  UPDATE_VOLUME,
} from '../constants/actionTypes';
import {TimeAction} from './timeStateAction';

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

export interface UpdateVolumeAction {
  type: typeof UPDATE_VOLUME;
  volume: number;
}

export interface UpdateQueueAction {
  type: typeof UPDATE_QUEUE;
  queue: Array<File>;
}

export interface UpdateSpeedAction {
  type: typeof UPDATE_SPEED;
  speed: number;
}

export interface UpdateSrcAction {
  type: typeof UPDATE_SRC;
  src: string;
  fileId: string;
  title: string;
}

export type PlayerActionTypes =
  | PlayerAction
  | TimeAction
  | UpdateBuffered
  | UpdateDuration
  | UpdateSrcAction
  | UpdateVolumeAction
  | UpdateQueueAction
  | UpdateSpeedAction;
