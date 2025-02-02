import React from 'react';
import styled from 'styled-components';

import { CurationsDummyData } from '../../assets/dummy/dummyDataArchive';
import CurationsList from '../Archive/CurationsList';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';

const Curation = () => {
  const curations = CurationsDummyData;

  return (
    <>
      <StCurationWrapper>
        <FixedContainer>
          <TopNav />
          <SearchBar onSearch={() => {}} />
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

  padding: 2rem 0.4rem;
  padding-top: 0rem;
  margin-bottom: 7rem;
`;

const FixedContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;

  padding: 2rem;
  padding-bottom: 0;
  background-color: ${({ theme }) => theme.colors.White};
`;
