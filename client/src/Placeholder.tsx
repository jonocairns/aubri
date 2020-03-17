import React from 'react';
import ContentLoader from 'react-content-loader';

export const Placeholder = () => (
  <ContentLoader
    height={320}
    width={320}
    speed={2}
    primaryColor="#a2a9b0"
    secondaryColor="#c5cacf"
  >
    <rect x="8" y="293" rx="4" ry="4" width="274" height="13" />
    <rect x="-31" y="-130" rx="5" ry="5" width="400" height="468" />
    <rect x="9" y="320" rx="4" ry="4" width="274" height="13" />
  </ContentLoader>
);
