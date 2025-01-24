import React from 'react';
import styled from 'styled-components';

import {
  FavoritePeopleDummyData,
  FavoriteWorksDummyData,
} from '../../assets/dummy/dummyDataArchive';
import FavoritesList from '../Archive/FavoritesList';
import BackButton from '../common/BackButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';

const SearchResult = () => {
  const contentList = FavoriteWorksDummyData;
  const celebList = FavoritePeopleDummyData;
  const placeList = FavoriteWorksDummyData;

  return (
    <>
      <StHomeWrapper>
        <IconText>
          <BackButton />
          <h3> 통합검색</h3>
        </IconText>
        <SearchBar />
        <ResultWrapper>
          <FavoritesList title="작품" data={contentList} />
          <FavoritesList title="인물" data={celebList} />
          <FavoritesList title="장소" data={placeList} />
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

  padding: 2rem;
  margin-bottom: 7rem;
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
  padding: 1rem 0;
`;
