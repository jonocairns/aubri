import { PLAY, PAUSE, UPDATE_CURRENT_TIME } from '../constants/actionTypes';

export interface PlayerAction {
    type: typeof PLAY | typeof PAUSE;
    payload: {
        isPlaying: boolean;
        id: string;
        file: string;
        totalTime: number;
        currentTime: number;
        title: string;
        audio: HTMLAudioElement;
    }
}

export interface UpdateTimeAction {
    type: typeof UPDATE_CURRENT_TIME;
    currentTime: number;
}

export type PlayerActionTypes = PlayerAction | UpdateTimeAction;