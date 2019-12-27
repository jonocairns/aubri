import React, {useEffect, useState} from 'react';
import Img from 'react-image';
import {useHistory} from 'react-router-dom';

import {Audiobook} from '../../server/src/core/schema';
import {settings} from './index';
import {Placeholder} from './Placeholder';

const Grid: React.FC = () => {
  const [list, setList] = useState(new Array<Audiobook>());
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const fetchData = async (baseUrl: string) => {
    const resp = await fetch(`${baseUrl}api/audio`);
    const data = await resp.json();
    setList(data);
    setLoading(false);
  };

  const handleNav = (id: string) => history.push(`/detail/${id}`);

  useEffect(() => {
    fetchData(settings.baseUrl);
  }, []);

  return (
    <div className="d-flex flex-wrap mt-5 justify-content-center">
      {!loading &&
        list.map(f => (
          <div
            onClick={() => handleNav(f.id)}
            key={f.id}
            className="card m-4 bg-transparent text-white border-0"
            style={{width: '16em', cursor: 'pointer'}}
          >
            <Img
              className="card-img-top"
              src={f.image}
              alt="..."
              loader={<Placeholder />}
            />

            <div className="card-body px-0 pt-2 pb-0 mb-0">
              <p className="card-title small text-uppercase font-weight-bold text-truncate pb-0 mb-0">
                {f.title}
              </p>
              <p className="text-truncate py-0 my-0" style={{opacity: 0.6}}>
                {f.author}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Grid;
