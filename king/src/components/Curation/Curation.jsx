import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getCurationList } from '../../lib/curation';
import CurationsList from '../Archive/CurationsList';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';

const Curation = () => {
  const [curationList, setCurationList] = useState([]);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState('');

  const getResults = async (searchQuery) => {
    const res = await getCurationList(searchQuery, cursor);
    setCurationList(res.items);
  };

  useEffect(() => {
    getResults(query);
  }, [query]);

  const handleSearch = (searchQuery) => {
    setQuery(searchQuery);
    setCurationList([]);
    getResults(searchQuery ? searchQuery : '');
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
