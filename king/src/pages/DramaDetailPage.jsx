import React from 'react';
import styled from 'styled-components';

import DramaDetails from '../components/Contents/DramaDetails';

const DramaDetailPage = () => {
  return (
    <>
      <DramaDetails />
    </>
  );
};

export default DramaDetailPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
