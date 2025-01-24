import React from 'react';
import styled from 'styled-components';

import ContentDetails from '../components/Contents/ContentDetails';

const ContentDetailPage = () => {
  return (
    <>
      y
      <ContentDetails />
    </>
  );
};

export default ContentDetailPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
