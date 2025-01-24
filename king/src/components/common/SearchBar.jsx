import React from 'react';
import styled from 'styled-components';

import { IcSearch } from '../../assets/icons';

const SearchBar = () => {
  return (
    <SWrapper>
      <input type="text" placeholder="검색어를 입력하세요." />
      <IcSearch />
    </SWrapper>
  );
};

export default SearchBar;

const SWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  height: 4rem;
  width: 100%;
  box-sizing: border-box;
  margin: 1rem 0;
  padding: 0 1.5rem;

  border-radius: 10px;
  background-color: #f3f3f3;

  & > input {
    all: unset;
    text-align: left;
    ${({ theme }) => theme.fonts.Body2};
  }
`;
