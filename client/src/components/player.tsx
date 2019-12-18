import React from 'react';
import { useSelector } from 'react-redux';
import { State } from '../State';

export const GlobalPlayer = () => {
    const currentTime = useSelector((state: State) => state.player.currentTime);
    const totalTime = useSelector((state: State) => state.player.totalTime);

    // const dispatch = useDispatch();


    const percent = (Number(currentTime)) / (totalTime / 1000) * 100;

    if(!isFinite(percent) || percent === 0) return null;

    console.log('rerender global player');

    return <div className="fixed-bottom">
        <div className="w-100 px-0 mx-0" style={{ height: '3px'}}>
            <div className="bg-warning" style={{ width: `${percent}%`, height: '3px', opacity: 0.5 }}>
            </div>
        </div>
    </div>

}