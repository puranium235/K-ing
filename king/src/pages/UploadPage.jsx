import React from 'react';
import styled from 'styled-components';

import Home from '../components/Home/Home';

const UploadPage = () => {
  return (
    <>
      <Home />
    </>
  );
};

export default UploadPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
