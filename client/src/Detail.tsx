import React, {useEffect, useState} from 'react';
import Img from 'react-image';
import {useDispatch} from 'react-redux';
import {useParams} from 'react-router-dom';

import {Audiobook, File} from '../../server/src/core/schema';
import {HydrateTimeAction} from './actions/timeStateAction';
import {useAuth0} from './Auth';
import {Crumb} from './Breadcrumb';
import {Stars} from './components/Stars';
import {HYDRATE_SESSIONS} from './constants/actionTypes';
import {settings} from './index';
import {Placeholder} from './Placeholder';
import Player from './Player';

const Detail: React.FC = () => {
  const dispatch = useDispatch();
  const {user} = useAuth0();
  const [book, setBook] = useState<Audiobook | null>(null);
  const [loading, setLoading] = useState(true);
  const [readMore, setReadMore] = useState(false);
  const {id} = useParams();

  console.log(user);
  useEffect(() => {
    const fetchData = async () => {
      const resp = await fetch(
        `${settings.REACT_APP_API_BASE_URL}api/audio/${id}/${user?.sub}`
      );
      const data = await resp.json();

      dispatch({
        type: HYDRATE_SESSIONS,
        sessions: data.sessions,
      } as HydrateTimeAction);

      setBook(data);
      setLoading(false);
    };

    fetchData();
  }, [id, dispatch, user]);

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

  const descriptionProps = {
    style: {
      maxHeight: readMore ? '999px' : '400px',
      transition: 'all 0.25s ease-in-out',
      overflow: 'hidden',
    },
  };

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
        <h3>{book.title}</h3>

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

        <div className="position-relative">
          {!readMore && (
            <div
              style={{
                backgroundImage:
                  'linear-gradient(to bottom, transparent 65%, #282c34)',
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                bottom: 0,
              }}
            ></div>
          )}
          <div
            {...descriptionProps}
            dangerouslySetInnerHTML={{__html: book.description}}
          ></div>
        </div>
        <button
          className="py-2 px-0 btn btn-link text-white"
          style={{cursor: 'pointer'}}
          onClick={() => setReadMore(!readMore)}
        >
          Read {readMore ? 'less' : 'more'}...
        </button>

        <div className="list-group mt-3">
          {(book as any).files.map((f: File) => (
            <Player
              key={f.id}
              title={f.filename}
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
