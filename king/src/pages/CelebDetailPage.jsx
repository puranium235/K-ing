import React from 'react';
import styled from 'styled-components';

import CelebDetails from '../components/Contents/CelebDetails';

const CelebDetailPage = () => {
  return (
    <>
      <CelebDetails />
    </>
  );
};

export default CelebDetailPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
