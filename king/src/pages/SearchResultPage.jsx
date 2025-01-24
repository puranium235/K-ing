import React from 'react';
import styled from 'styled-components';

import SearchResult from '../components/Search/SearchResult';

const SearchResultPage = () => {
  return (
    <>
      <SearchResult />
    </>
  );
};

export default SearchResultPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
