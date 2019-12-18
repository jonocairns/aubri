export interface PlayerState {
    isPlaying: boolean;
    currentTime: number;
    title: string;
    totalTime: number;
}

export interface State {
    player: PlayerState;
}