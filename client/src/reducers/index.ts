
import { combineReducers } from 'redux';
import { playerReducer } from './player';

export const rootReducer = combineReducers({
  player: playerReducer
})

export type RootState = ReturnType<typeof rootReducer>