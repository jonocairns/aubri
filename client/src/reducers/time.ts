import {TimeActionTypes} from '../actions/timeStateAction';
import {HYDRATE_SESSIONS, UPDATE_CURRENT_TIME} from '../constants/actionTypes';
import {TimeState} from '../State';

const initialState: TimeState = {};

export const timeReducer = (
  state = initialState,
  action: TimeActionTypes
): TimeState => {
  switch (action.type) {
    case HYDRATE_SESSIONS:
      return {
        ...state,
        ...Object.assign(
          {},
          ...action.sessions.map(s => ({[s.fileid]: Number(s.time)}))
        ),
      };
    case UPDATE_CURRENT_TIME:
      return {
        ...state,
        [action.payload.id]: action.payload.time,
      };
    default:
      return state;
  }
};
