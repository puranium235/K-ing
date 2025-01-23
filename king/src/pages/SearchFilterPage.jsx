import React from 'react';
import styled from 'styled-components';

import SearchFilter from '../components/Search/SearchFilter';

const SearchFilterPage = () => {
  return (
    <>
      <SearchFilter />
    </>
  );
};

export default SearchFilterPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
