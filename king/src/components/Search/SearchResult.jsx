import React, { useEffect, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { getSearchResult } from '../../lib/search';
import { SearchCategoryState, SearchPrevQuery, SearchQueryState } from '../../recoil/atom';
import BackButton from '../common/BackButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import SearchList from './SearchList';

const SearchResult = () => {
  const setPrevQuery = useSetRecoilState(SearchPrevQuery);
  const [searchQuery, setSearchQuery] = useRecoilState(SearchQueryState);
  const [searchCategory, setSearchCategory] = useRecoilState(SearchCategoryState);

  const [results, setResults] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [celebList, setCelebList] = useState([]);
  const [placeList, setPlaceList] = useState([]);

  const getResults = async (query, category) => {
    const res = await getSearchResult({ query: query || '', category: category || '', size: 20 });
    setResults(res.results);
    console.log(res.results);
  };

  const handleSearch = (query, category) => {
    setSearchQuery(query);
    setSearchCategory(category);
    setPrevQuery(query);
    getResults(query, category);
  };

  useEffect(() => {
    getResults(searchQuery, searchCategory);
  }, [searchQuery, searchCategory]);

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
          <SearchBar query={searchQuery} onSearch={handleSearch} />
        </Header>
        <ResultWrapper>
          <SearchList title="작품" data={contentList} type="CONTENT" />
          <SearchList title="인물" data={celebList} type="CAST" />
          <SearchList title="장소" data={placeList} type="PLACE" />
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
  margin-bottom: 7rem;
  padding: 2rem;
`;

const Header = styled.div`
  width: 100%;
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
  width: 100%;
  margin-top: 1rem;
`;
