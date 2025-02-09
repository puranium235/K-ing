import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import styled from 'styled-components';

import useGetCurationList from '../../hooks/search/useGetCurationList';
import { catchLastScrollItem } from '../../util/\bcatchLastScrollItem';
import CurationsList from '../Archive/CurationsList';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';

const Curation = () => {
  const [query, setQuery] = useState('');
  const { curationList, getNextData, isLoading, hasMore } = useGetCurationList(query);

  const lastElementRef = useRef(null);

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading]);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
  };

  return (
    <>
      <StCurationWrapper>
        <FixedContainer>
          <TopNav />
          <SearchBar query="" type="curation" onSearch={handleSearch} />
        </FixedContainer>
        <CurationWrapper>
          <CurationsList data={curationList} />
        </CurationWrapper>
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
  padding: 2rem;
  padding-bottom: 0;
  margin-bottom: 7rem;
`;

const FixedContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;

  width: 100%;

  background-color: ${({ theme }) => theme.colors.White};
`;

const CurationWrapper = styled.div`
  margin-top: 1rem;
  width: 100%;
`;
