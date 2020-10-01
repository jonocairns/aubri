import React, {useEffect, useState} from 'react';
import Img from 'react-image';
import {useHistory} from 'react-router-dom';

import {Audiobook} from '../../server/src/core/schema';
import {useAuth0} from './Auth';
import {settings} from './index';
import {Placeholder} from './Placeholder';
import {useInfiniteScroll} from './useInfinitScroll';

const Grid: React.FC = () => {
  const [list, setList] = useState(new Array<Audiobook>());
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [query, setQuery] = useState('');
  const history = useHistory();
  const {fetchAuthenticated} = useAuth0();

  const fetchData = async (baseUrl: string, q: string) => {
    let length = list.length;
    if (q && list.length > 0) {
      length = 0;
    }
    const data = await fetchAuthenticated(
      `${baseUrl}api/audio/grid/${length}/${q}`
    );
    if (length > 0) {
      setList(([] as Array<Audiobook>).concat(list, data.items));
    } else {
      setList(data.items);
    }
    setHasMore(data.hasMore);
    setLoading(false);
  };

  const infiniteRef = useInfiniteScroll({
    loading,
    hasNextPage: hasMore,
    onLoadMore: async () => await fetchData(settings.baseUrl, query),
    scrollContainer: 'window',
  });

  const handleNav = (id: string) => history.push(`/detail/${id}`);

  useEffect(() => {
    fetchData(settings.baseUrl, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <form className="d-flex justify-content-center form-inline mt-5">
        <input
          className="form-control mr-sm-2"
          type="search"
          placeholder="Search for a book..."
          aria-label="Search"
          style={{minWidth: '300px'}}
          onChange={c => {
            fetchData(settings.baseUrl, c.target.value);
          }}
        />
      </form>
      <div
        ref={infiniteRef as any}
        className="d-flex flex-wrap mt-3 justify-content-center"
      >
        {!loading &&
          list.map(f => (
            <div
              onClick={() => handleNav(f.id)}
              key={f.id}
              className="card m-4 bg-transparent text-white border-0"
              style={{width: '20em', cursor: 'pointer'}}
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
    </>
  );
};

export default Grid;
