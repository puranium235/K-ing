import React from 'react';
import styled from 'styled-components';

import { curationsDummyData } from '../../assets/dummy/dummyDataArchive';
import CurationsList from '../Archive/CurationsList';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';

const Curation = () => {
  const curations = curationsDummyData;

  return (
    <>
      <StCurationWrapper>
        <FixedContainer>
          <TopNav />
          <SearchBar />
        </FixedContainer>
        <CurationsList data={curations} />
      </StCurationWrapper>
      <Nav />
    </>
  );
};

export default Curation;

const StCurationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  /* padding: 2rem; */
  margin-bottom: 7rem;
`;

const FixedContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;

  padding-top: 2rem;
  background-color: ${({ theme }) => theme.colors.White};
`;
