import React from 'react';
import styled from 'styled-components';

import Archive from '../components/Archive/Archive';

const ArchivePage = () => {
  return (
    <StArchivePageWrapper>
      <Archive />
    </StArchivePageWrapper>
  );
};

export default ArchivePage;

const StArchivePageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;
