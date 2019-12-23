import {PlayerActionTypes} from '../actions/playerStateAction';
import {
  PAUSE,
  PLAY,
  UPDATE_BUFFERED,
  UPDATE_CURRENT_TIME,
  UPDATE_DURATION,
  UPDATE_SRC,
  UPDATE_VOLUME,
} from '../constants/actionTypes';
import {PlayerState} from '../State';

const initialState: PlayerState = {
  id: '',
  file: '',
  playing: false,
  buffered: 0,
  currentTime: 0,
  duration: 0,
  src: '',
  title: '',
  volume: 1,
};

export const playerReducer = (
  state = initialState,
  action: PlayerActionTypes
): PlayerState => {
  switch (action.type) {
    case PLAY:
      return {
        ...state,
        playing: true,
      };
    case PAUSE:
      return {
        ...state,
        playing: false,
      };
    case UPDATE_CURRENT_TIME:
      return {
        ...state,
        currentTime: action.currentTime,
      };
    case UPDATE_DURATION:
      return {
        ...state,
        duration: action.duration,
      };
    case UPDATE_BUFFERED:
      return {
        ...state,
        buffered: action.buffered,
      };
    case UPDATE_VOLUME:
      return {
        ...state,
        volume: action.volume,
      };
    case UPDATE_SRC:
      return {
        ...state,
        src: action.src,
        id: action.id,
        file: action.file,
        title: action.title,
      };
    default:
      return state;
  }
};
