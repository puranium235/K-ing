import React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { getSearchResult } from '../../lib/search';
import { SearchCategoryState, SearchQueryState } from '../../recoil/atom';
import BackButton from '../common/BackButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import SearchList from './SearchList';

const SearchResult = () => {
  const query = useRecoilValue(SearchQueryState);
  const category = useRecoilValue(SearchCategoryState);
  const [results, setResults] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [celebList, setCelebList] = useState([]);
  const [placeList, setPlaceList] = useState([]);

  const getResults = async () => {
    const res = await getSearchResult(query, category);
    setResults(res.results);
    console.log(res.results);
  };

  useEffect(() => {
    getResults();
  }, [query]);

  useEffect(() => {
    if (results) {
      setContentList(
        results.filter(
          (item) =>
            item.category === 'DRAMA' || item.category === 'MOVIE' || item.category === 'SHOW',
        ),
      );
      setCelebList(results.filter((item) => item.category === 'CAST'));
      setPlaceList(results.filter((item) => item.category === 'PLACE'));
    }
  }, [results]);

  if (!results) {
    return null;
  }

  return (
    <>
      <StHomeWrapper>
        <Header>
          <IconText>
            <BackButton />
            <h3> 통합검색</h3>
          </IconText>
          <SearchBar onSearch={() => {}} />
        </Header>
        <ResultWrapper>
          <SearchList title="작품" data={contentList} />
          <SearchList title="인물" data={celebList} />
          <SearchList title="장소" data={placeList} />
        </ResultWrapper>
        <Nav />
      </StHomeWrapper>
    </>
  );
};

export default SearchResult;

const StHomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  text-align: center;

  /* width: 100%; */
  /* padding: 2rem; */
  margin-bottom: 7rem;
`;

const Header = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 2rem 2rem 0 2rem;
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;

  h3 {
    width: 100%;
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title3};
  }
`;

const ResultWrapper = styled.div`
  margin: 0 1rem;
  /* width: 100%; */
`;
