import {PlayerActionTypes} from '../actions/playerStateAction';
import {
  PAUSE,
  PLAY,
  UPDATE_BUFFERED,
  UPDATE_CURRENT_TIME,
  UPDATE_DURATION,
  UPDATE_QUEUE,
  UPDATE_SPEED,
  UPDATE_SRC,
  UPDATE_VOLUME,
} from '../constants/actionTypes';
import {PlayerState} from '../State';

const initialState: PlayerState = {
  fileId: '',
  playing: false,
  buffered: 0,
  currentTime: 0,
  duration: 0,
  src: '',
  title: '',
  volume: 1,
  queue: [],
  speed: 1,
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
        currentTime: action.payload.time,
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
    case UPDATE_QUEUE:
      return {
        ...state,
        queue: action.queue,
      };
    case UPDATE_SPEED:
      return {
        ...state,
        speed: action.speed,
      };
    case UPDATE_SRC:
      return {
        ...state,
        src: action.src,
        fileId: action.fileId,
        title: action.title,
      };
    default:
      return state;
  }
};
