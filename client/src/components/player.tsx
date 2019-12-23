import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../State';
import { PAUSE, UPDATE_BUFFERED, PLAY, UPDATE_CURRENT_TIME, UPDATE_DURATION, UPDATE_TIME } from '../constants/actionTypes';
import { TimeAction } from '../actions/timeStateAction';
import { SvgPlayCircleOutline24Px } from '../icons/PlayCircleOutline24Px';
import { SvgPauseCircleOutline24Px } from '../icons/PauseCircleOutline24Px';
import { SvgSkipPrevious24Px } from '../icons/SkipPrevious24Px';
import { SvgSkipNext24Px } from '../icons/SkipNext24Px';
import { PlayerAction } from '../actions/playerStateAction';
import { title } from 'process';
import { debounce } from 'lodash';

let current: any = null;

const audioEvents = ["error", "progress", "play", "pause", "ended", "timeupdate", "loadedmetadata", "loadstart"];

export const GlobalPlayer = () => {
    const dispatch = useDispatch();
    const { id, file, playing, src, currentTime, duration } = useSelector((state: State) => state.player);
    const times = useSelector((state: State) => state.times);
    const [audio, setAudio] = useState(new Audio());

    const handlePlayerEvent = (evt: Event) => {
        console.log(`got event ${evt.type}`);

        switch (evt.type) {
            case "error":
                // NowPlayingActions.setError(evt.srcElement.error);
                console.log("Error received from Audio component:");
                console.error(evt);
                break;

            case "progress":
                var range = audio.buffered;
                if (range.length > 0) {
                    dispatch({ type: UPDATE_BUFFERED, buffered: range.end(range.length - 1) });
                }
                break;

            case "play":
                if (!playing) {
                    dispatch({ type: PLAY });
                }
                break;

            case "pause":
                if (playing) {
                    dispatch({ type: PAUSE });
                }
                break;

            case "ended":
                // NowPlayingActions.ended(NowPlayingStore.getSource(), NowPlayingStore.getRepeat());
                break;

            case "timeupdate":
                dispatch({ type: UPDATE_CURRENT_TIME, currentTime: audio.currentTime });
                dispatch({ type: UPDATE_TIME, payload: { time: audio.currentTime, id: id + file } } as TimeAction);
                break;

            case "loadedmetadata":
                // dispatch({ type: UPDATE_DURATION, duration: audio.duration });
                // fetch time here?
                dispatch({ type: UPDATE_CURRENT_TIME, currentTime: audio.currentTime });
                dispatch({ type: UPDATE_TIME, payload: { time: audio.currentTime, id: id + file } } as TimeAction);
                if (playing) {
                    audio.play();
                }
                break;

            case "loadstart":
                // NowPlayingActions.reset();
                break;

            default:
                console.warn("unhandled player event:");
                console.warn(evt);
                break;
        }
    }

    React.useEffect(() => {
        for (let e of audioEvents) {
            audio.addEventListener(e, handlePlayerEvent);
        }

        return () => {
            audio.pause();
            for (let e of audioEvents) {
                audio.removeEventListener(e, handlePlayerEvent);
            }
            audio.src = '';
        }
    }, [id, file]);


    React.useEffect(() => {

        if (playing) {
            audio.src = src;
            audio.currentTime = times[id + file] || 0
            audio.play();
        } else {
            audio.pause();
        }

    }, [src, playing]);

    const percent = (Number(currentTime)) / (duration) * 100;

    React.useEffect(() => debounce(() => {
        if (currentTime !== 0 && playing) {
            fetch(`http://localhost:6969/api/audio/save/${id}/${file}/${currentTime}`);
            console.log(`saving time ${currentTime}`);
        }
    }, 2000), [currentTime, id, file, playing])

    const toggle = () => {
        dispatch({ type: PAUSE } as PlayerAction);
    };

    console.log('rerender global player');

    const iconProps = {
        fill: 'white',
        fontSize: '32px',
        className: 'mx-2'
    }

    return <div className="fixed-bottom bg-dark" style={{ opacity: 0.8 }}>

        {isFinite(percent) && <div className="w-100 px-0 mx-0" style={{ height: '3px' }}>
            <div className="bg-warning" style={{ width: `${percent}%`, height: '3px', opacity: 0.5 }}>
            </div>
        </div>}
        <div className="d-flex p-3 text-white">
            <div className="col-3">{title}</div>
            <div className="col-6 d-flex justify-content-center">
                <SvgSkipPrevious24Px {...iconProps} />

                <SvgPauseCircleOutline24Px {...iconProps} onClick={toggle} />
                <SvgPlayCircleOutline24Px {...iconProps} onClick={toggle} />

                <SvgSkipNext24Px {...iconProps} />
            </div>
            <div className="col-3"></div>
        </div>
    </div>

}