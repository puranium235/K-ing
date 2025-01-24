import React from 'react';
import styled from 'styled-components';

import SearchKeyword from '../components/Search/SearchKeyword';

const SearchKeywordpage = () => {
  return (
    <>
      <SearchKeyword />
    </>
  );
};

export default SearchKeywordpage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
