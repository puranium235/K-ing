import React from 'react';
import styled from 'styled-components';

import Landing from '../components/Landing/Landing';

const LandingPage = () => {
  return (
    <>
      <Landing />
    </>
  );
};

export default LandingPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
