import React from 'react';

import Header from './Header';
import ImageHeader from './ImageHeader';

const DetailHeader = ({ title, isOption, imageSrc, imageAltText }) => {
  return (
    <>
      <Header title={title} isOption={isOption} />
      <ImageHeader src={imageSrc} alt={imageAltText} />
    </>
  );
};

export default DetailHeader;
