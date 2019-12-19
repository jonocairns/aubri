import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { State } from '../State';
import { UPDATE_TIME } from '../constants/actionTypes';
import { TimeAction } from '../actions/timeStateAction';

let current: any = null;

export const GlobalPlayer = () => {
    const dispatch = useDispatch();
    const { totalTime, currentTime, audio, id, file } = useSelector((state: State) => state.player);


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

    if (!isFinite(percent) || percent === 0) return null;

    console.log('rerender global player');




    return <div className="fixed-bottom">
        <div className="w-100 px-0 mx-0" style={{ height: '3px' }}>
            <div className="bg-warning" style={{ width: `${percent}%`, height: '3px', opacity: 0.5 }}>
            </div>
        </div>
    </div>

}