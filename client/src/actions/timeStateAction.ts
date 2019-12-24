import {Session} from '../../../server/src/core/schema';
import {HYDRATE_SESSIONS, UPDATE_TIME} from '../constants/actionTypes';

export interface TimeAction {
  type: typeof UPDATE_TIME;
  payload: {id: string; time: number};
}

export interface HydrateTimeAction {
  type: typeof HYDRATE_SESSIONS;
  sessions: Array<Session>;
}

export type TimeActionTypes = TimeAction | HydrateTimeAction;
