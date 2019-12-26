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
    fetchData(settings.REACT_APP_API_BASE_URL);
  }, []);

  return (
    <div className="d-flex flex-wrap mt-5 justify-content-center">
      {!loading &&
        list.map(f => (
          <div
            onClick={() => handleNav(f.id)}
            key={f.id}
            className="card m-2"
            style={{width: '18em', cursor: 'pointer'}}
          >
            <Img
              className="card-img-top"
              src={f.image}
              alt="..."
              loader={<Placeholder />}
            />

            {/* <img src={f.image} className="card-img-top" alt="..." /> */}
            <div className="card-body">
              <h5 className="card-title">{f.title}</h5>
              <p className="card-text text-truncate">{f.subtitle}</p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default Grid;
