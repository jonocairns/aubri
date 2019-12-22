import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../State';
import { UPDATE_TIME, PAUSE } from '../constants/actionTypes';
import { TimeAction } from '../actions/timeStateAction';
import { SvgPlayCircleOutline24Px } from '../icons/PlayCircleOutline24Px';
import { SvgPauseCircleOutline24Px } from '../icons/PauseCircleOutline24Px';
import { SvgSkipPrevious24Px } from '../icons/SkipPrevious24Px';
import { SvgSkipNext24Px } from '../icons/SkipNext24Px';
import { PlayerAction } from '../actions/playerStateAction';

let current: any = null;

export const GlobalPlayer = () => {
    const dispatch = useDispatch();
    const { totalTime, currentTime, audio, id, file, isPlaying, title } = useSelector((state: State) => state.player);


    const percent = (Number(currentTime)) / (totalTime / 1000) * 100;

    React.useEffect(() => {
        current = setInterval(async () => {
            if (audio && audio.currentTime !== 0) {
                await fetch(`http://localhost:6969/api/audio/save/${id}/${file}/${audio.currentTime}`);
                dispatch({ type: UPDATE_TIME, payload: { time: audio.currentTime, id: id + file } } as TimeAction);
                console.log(`saving time ${audio.currentTime}`);
            }

        }, 1000);

        return () => {
            clearInterval(current);
        }
    }, [audio, id, file])


    const toggle = () => {
        dispatch({ type: PAUSE} as PlayerAction);
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
                {isPlaying ?
                    <SvgPauseCircleOutline24Px {...iconProps} onClick={toggle} /> :
                    <SvgPlayCircleOutline24Px {...iconProps} onClick={toggle} />}

                <SvgSkipNext24Px {...iconProps} />
            </div>
            <div className="col-3"></div>
        </div>
    </div>

}