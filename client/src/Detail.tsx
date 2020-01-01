import {some} from 'lodash';
import React, {useEffect, useState} from 'react';
import Img from 'react-image';
import {useDispatch} from 'react-redux';
import {useParams} from 'react-router-dom';

import {Audiobook, File} from '../../server/src/core/schema';
import {HydrateTimeAction} from './actions/timeStateAction';
import {useAuth0} from './Auth';
import {Crumb} from './Breadcrumb';
import {iconProps} from './components/GlobalPlayer';
import {Stars} from './components/Stars';
import {HYDRATE_SESSIONS} from './constants/actionTypes';
import {get, remove, save} from './db';
import {SvgCloudDone24Px} from './icons/CloudDone24Px';
import {SvgCloudDownload24Px} from './icons/CloudDownload24Px';
import {SvgDelete24Px} from './icons/Delete24Px';
import {settings} from './index';
import {Placeholder} from './Placeholder';
import Player from './Player';
import {useInterval} from './useInterval';

const Detail: React.FC = () => {
  const dispatch = useDispatch();
  const {user} = useAuth0();
  const [book, setBook] = useState<Audiobook | null>(null);
  const [loading, setLoading] = useState(true);
  const {fetchAuthenticated} = useAuth0();
  const [localUrls, setLocalUrls] = useState<{[id: string]: string}>({});
  const [downloading, setDownloading] = useState(false);
  const [color, setColor] = useState('white');

  const {id} = useParams();

  useInterval(() => {
    if (downloading) {
      if (color === 'white') {
        setColor('#1FFFC5');
      } else {
        setColor('white');
      }
    }
  }, 200);

  console.log(user);
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAuthenticated(
        `${settings.baseUrl}api/audio/${id}`
      );

      const allResponses = await Promise.all(
        data.files.map(async (f: File) => ({[f.id]: await get(f.id)}))
      );

      const one: {[id: string]: string} = allResponses.reduce(
        (acc: any, curr: any) => ({...acc, ...curr}),
        {}
      ) as any;

      setLocalUrls(one);

      dispatch({
        type: HYDRATE_SESSIONS,
        sessions: data.sessions,
      } as HydrateTimeAction);

      setBook(data);
      setLoading(false);
    };

    fetchData();
  }, [id, dispatch, user, fetchAuthenticated]);

  if (loading || !book) {
    return null;
  }

  const length = (runtime: number) => {
    const hours = Math.floor(runtime / 60);
    const minutes = runtime - hours * 60;

    let out = '';
    if (hours > 0) {
      out = `${hours} hour(s)`;
    }
    if (hours > 0 && minutes > 0) {
      out = `${out} and `;
    }

    if (minutes > 0) out = `${out}${minutes} minute(s)`;

    return out;
  };

  const handleDownload = async () => {
    setDownloading(true);
    const download = async (fileId: string) => {
      console.log('downloading...');
      const file = await fetch(
        `${settings.baseUrl}api/audio/download/${fileId}`
      );
      const blob = await file.blob();
      console.log('completed download... storing in indexdb');

      await save(blob, fileId);
      const url = await get(fileId);
      return {[fileId]: url};
    };

    const items = await Promise.all(
      (book as any).files.map(async (f: File) => {
        return await download(f.id);
      })
    );

    const one = items.reduce(
      (acc: any, curr: any) => ({...acc, ...curr}),
      {}
    ) as any;

    console.log(one);
    setLocalUrls(one);

    setDownloading(false);
  };

  const handleDelete = async () => {
    await Promise.all(
      (book as any).files.map(async (f: File) => await remove(f.id))
    );
    setLocalUrls({});
  };

  const hasLocalFiles = some(
    (book as any).files.map((f: File) => localUrls[f.id] !== undefined)
  );

  return (
    <div className="container d-flex flex-wrap">
      <div className="col-12">
        <Crumb
          items={[
            {link: '/', label: 'Library'},
            {link: `/${book.id}`, label: book.title, active: true},
          ]}
        />
      </div>
      <div className="col-12 col-md-4">
        <Img
          className="img-fluid"
          src={book.image}
          alt={book.title}
          loader={<Placeholder />}
        />
      </div>
      <div className="col-12 col-md-8 text-light">
        <div className="d-flex justify-content-between">
          <h3>{book.title}</h3>
          <div>
            {hasLocalFiles && (
              <SvgDelete24Px {...iconProps} onClick={handleDelete} />
            )}
            {hasLocalFiles ? (
              <SvgCloudDone24Px {...iconProps} />
            ) : (
              <SvgCloudDownload24Px
                {...iconProps}
                className={`${iconProps.className} theme-transition`}
                fill={color}
                onClick={handleDownload}
              />
            )}
          </div>
        </div>

        <p>{book.subtitle}</p>

        <p className="my-0">Written by: {book.author}</p>
        <p className="my-0">Narrated by: {book.narrator}</p>
        <p className="my-0">
          {!isNaN(book.stars) && <Stars stars={Number(book.stars)} />}{' '}
          <span className="small">
            ({book.ratings.toLocaleString()} ratings)
          </span>
        </p>
        <p>Length: {length(book.runtime)}</p>

        <div dangerouslySetInnerHTML={{__html: book.description}}></div>

        <div className="list-group mt-3">
          {(book as any).files.map((f: File) => (
            <Player
              localUrl={localUrls[f.id]}
              key={f.id}
              title={f.title || f.filename}
              fileId={f.id}
              duration={f.duration}
              queue={(book as any).files}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Detail;
