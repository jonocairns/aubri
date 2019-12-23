import React from 'react';
import {Link} from 'react-router-dom';

interface Props {
  items: Array<{link: string; label: string; active?: boolean}>;
}

export const Crumb = ({items}: Props) => {
  return (
    <div>
      <div
        aria-label="breadcrumb"
        className="text-white py-3 my-2"
        style={{backgroundColor: 'none'}}
      >
        {items.map((item, i) => (
          <React.Fragment key={item.link}>
            <span>
              {item.active ? (
                item.label
              ) : (
                <Link className="text-white" to={item.link}>
                  {item.label}
                </Link>
              )}
            </span>
            {i < items.length - 1 && <span className="px-2">/</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
