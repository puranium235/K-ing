import React from 'react';
import styled from 'styled-components';

const MyPage = () => {
  return <>마이페이지</>;
};

export default MyPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
