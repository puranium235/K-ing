import React from 'react';
import styled from 'styled-components';

import Home from '../components/Home/Home';
import Signup from '../components/Signup/Signup';

const SignupPage = () => {
  return (
    <>
      <Signup />
    </>
  );
};

export default SignupPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
