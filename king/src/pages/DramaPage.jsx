import React from 'react';
import styled from 'styled-components';

import Drama from '../components/contents/Drama';

const DramaPage = () => {
  return (
    <>
      <Drama />
    </>
  );
};

export default DramaPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
