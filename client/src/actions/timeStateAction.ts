import {UPDATE_TIME} from '../constants/actionTypes';

export interface TimeAction {
  type: typeof UPDATE_TIME;
  payload: {
    id: string;
    time: number;
  };
}

export type TimeActionTypes = TimeAction;
