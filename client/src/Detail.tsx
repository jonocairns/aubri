import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useParams} from 'react-router-dom';

import {Audiobook, File} from '../../server/src/core/schema';
import {HydrateTimeAction} from './actions/timeStateAction';
import {Crumb} from './Breadcrumb';
import {HYDRATE_SESSIONS} from './constants/actionTypes';
import Player from './Player';

const Detail: React.FC = () => {
  const dispatch = useDispatch();
  const [book, setBook] = useState<Audiobook | null>(null);
  const [loading, setLoading] = useState(true);
  const {id} = useParams();

  useEffect(() => {
    const fetchData = async () => {
      const resp = await fetch(`http://localhost:6969/api/audio/${id}`);
      const data = await resp.json();

      dispatch({
        type: HYDRATE_SESSIONS,
        sessions: data.sessions,
      } as HydrateTimeAction);

      setBook(data);
      setLoading(false);
    };

    fetchData();
  }, [id, dispatch]);

  if (loading || !book) {
    return null;
  }

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
        <img src={book.image} alt={book.title} className="img-fluid" />
      </div>
      <div className="col-12 col-md-8 text-light">
        <h3>{book.title}</h3>

        <p>{book.subtitle}</p>

        <div dangerouslySetInnerHTML={{__html: book.description}}></div>

        <p>Written by: {book.author}</p>
        <p>Narrated by: {book.narrator}</p>
        <p>
          {book.stars} with {book.ratings}
        </p>
        <p>{book.runtime}</p>

        <div className="list-group">
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
