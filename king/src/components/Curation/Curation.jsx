import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { getCurationList } from '../../lib/curation';
import { SearchQueryState } from '../../recoil/atom';
import CurationsList from '../Archive/CurationsList';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';

const Curation = () => {
  const [curationList, setCurationList] = useState([]);
  const [query, setQuery] = useRecoilState(SearchQueryState);
  const [cursor, setCursor] = useState('');

  const getResults = async (searchQuery) => {
    const res = await getCurationList(searchQuery, cursor);
    setCurationList(res.items);
  };

  useEffect(() => {
    getResults(query);
  }, [query]);

  const handleSearch = (searchQuery) => {
    setCurationList([]);
    getResults(searchQuery ? searchQuery : '');
  };

  return (
    <>
      <StCurationWrapper>
        <FixedContainer>
          <TopNav />
          <SearchBar query={query} onSearch={handleSearch} />
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

// ✅ 스타일 정의
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
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.White};
`;

const CurationWrapper = styled.div`
  margin-top: 1rem;
  width: 100%;
`;
