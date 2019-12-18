import { PLAY, PAUSE, UPDATE_CURRENT_TIME } from '../constants/actionTypes';
import { PlayerState } from '../State';
import { PlayerActionTypes } from '../actions/playerStateAction';

const initialState: PlayerState = {
    isPlaying: false,
    currentTime: 0,
    title: '',
    totalTime: 0
}

export const playerReducer =(
    state = initialState,
    action: PlayerActionTypes
): PlayerState => {
    switch (action.type) {
        case PLAY:
        case PAUSE:
            return {
                ...state,
                isPlaying: action.payload.isPlaying,
                currentTime: action.payload.currentTime,
                title: action.payload.title,
                totalTime: action.payload.totalTime
            }
        case UPDATE_CURRENT_TIME:
            return {
                ...state,
                currentTime: action.currentTime
            }
        default:
            return state
    }
}