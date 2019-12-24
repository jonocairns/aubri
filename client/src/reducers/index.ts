import {combineReducers} from 'redux';

import {playerReducer} from './player';
import {timeReducer} from './time';

export const rootReducer = combineReducers({
  player: playerReducer,
  time: timeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
