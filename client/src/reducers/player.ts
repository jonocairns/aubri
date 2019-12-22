import { PLAY, PAUSE, UPDATE_CURRENT_TIME } from '../constants/actionTypes';
import { PlayerState } from '../State';
import { PlayerActionTypes } from '../actions/playerStateAction';

const initialState: PlayerState = {
    isPlaying: false,
    currentTime: 0,
    id: '',
    file: '',
    totalTime: 0,
    audio: undefined,
    title: ''
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
                id: action.payload.id,
                file: action.payload.file,
                totalTime: action.payload.totalTime,
                title: action.payload.title,
                audio: action.payload.audio
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