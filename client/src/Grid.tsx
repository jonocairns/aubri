import React, { useState, useEffect } from 'react';
import { Audiobook } from '../../server/contracts/audiobook';
import { useHistory } from 'react-router-dom';

const Grid: React.FC = () => {
  const [list, setList] = useState(new Array<Audiobook>());
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  const fetchData = async () => {
    const resp = await fetch('http://localhost:6969/api/audio');
    const data = await resp.json();
    setList(data);
    setLoading(false);
  }

  const handleNav = (id: string) => history.push(`/detail/${id}`);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container">
      {!loading && list.map(f =>
        <div onClick={() => handleNav(f.id)} key={f.id} className="card" style={{ width: '18em' }}>
          <img src={f.image} className="card-img-top" alt="..." />
          <div className="card-body">
            <h5 className="card-title">{f.title}</h5>
            <p className="card-text text-truncate">{f.subtitle}</p>
            {/* <Player url={`http://localhost:6969/api/audio/play/${f.fileName}`} /> */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Grid;
