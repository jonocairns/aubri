import {combineReducers} from 'redux';

import {playerReducer} from './player';
import {timeReducer} from './time';

export const rootReducer = combineReducers({
  player: playerReducer,
  times: timeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
