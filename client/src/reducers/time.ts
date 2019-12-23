import {TimeActionTypes} from '../actions/timeStateAction';
import {UPDATE_TIME} from '../constants/actionTypes';
import {TimeState} from '../State';

const initialState: TimeState = {};

export const timeReducer = (
  state = initialState,
  action: TimeActionTypes
): TimeState => {
  switch (action.type) {
    case UPDATE_TIME:
      return {
        ...state,
        [action.payload.id]: action.payload.time,
      };
    default:
      return state;
  }
};
