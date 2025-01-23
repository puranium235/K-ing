import React from 'react';
import styled from 'styled-components';

import Curation from '../components/Curation/Curation';

const CurationPage = () => {
  return (
    <>
      <Curation />
    </>
  );
};

export default CurationPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
