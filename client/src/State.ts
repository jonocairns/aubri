export interface PlayerState {
    isPlaying: boolean;
    currentTime: number;
    id: string;
    file: string
    totalTime: number;
    title: string;
    audio: HTMLAudioElement | undefined;
}

export interface TimeState {
    [key: string]: number;
}

export interface State {
    player: PlayerState;
    times: TimeState;
}