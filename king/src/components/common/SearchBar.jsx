import React from "react";
import styled from "styled-components";

import { IcSearch } from "../../assets/icons";

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
  justify-content: space-around;
  align-items: center;

  height: 40px;
  width: 100%;
  box-sizing: border-box;
  gap: 1rem;
  margin: 1rem 0;

  border-radius: 10px;
  background-color: #f3f3f3;

  & > input {
    all: unset;
    width: 70%;
    text-align: left;
    ${({ theme }) => theme.fonts.Body2};
  }
`;
