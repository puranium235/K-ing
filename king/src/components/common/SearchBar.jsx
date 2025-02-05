import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

import { IcSearch } from '../../assets/icons';
import { getAutoKeyword } from '../../lib/search';
import { getContentTypeKor } from '../../util/getContentType';

const SearchBar = ({ type, query, onSearch }) => {
  const [keyword, setKeyword] = useState(query);
  const [category, setCategory] = useState('');
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);

  // debounce -> 호출 지연
  const handleSearchChange = useCallback(
    debounce(async (searchText) => {
      const res = await getAutoKeyword(searchText, type);
      setAutoCompleteOptions(res.results);
    }, 300),
    [],
  );

  const onChangeData = (e) => {
    setKeyword(e.currentTarget.value);
    handleSearchChange(e.currentTarget.value);
  };

  const handleOptionClick = (option) => {
    setAutoCompleteOptions([]);

    setKeyword(option.name);
    setCategory(option.category);
  };

  const handleSubmit = () => {
    setAutoCompleteOptions([]);
    onSearch(keyword, category);
  };

  const handleKeyEnter = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <SWrapper>
      <input
        type="text"
        placeholder="검색어를 입력하세요."
        value={keyword}
        onChange={onChangeData}
        onKeyDown={handleKeyEnter}
      />
      <IcSearch onClick={handleSubmit} />
      {autoCompleteOptions.length > 0 && (
        <AutoSearchContainer>
          <AutoSearchWrap>
            {autoCompleteOptions.map((option, index) => (
              <AutoSearchData key={index} onClick={() => handleOptionClick(option)}>
                {option.name} <a>{getContentTypeKor(option.category.toLowerCase())}</a>
              </AutoSearchData>
            ))}
          </AutoSearchWrap>
        </AutoSearchContainer>
      )}
    </SWrapper>
  );
};

export default SearchBar;

const SWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  position: relative;

  height: 4rem;
  width: 100%;
  box-sizing: border-box;
  margin: 1rem 0;
  padding: 0 1.5rem;

  border-radius: 10px;
  background-color: #f3f3f3;

  & > input {
    all: unset;
    flex-grow: 1;
    text-align: left;
    padding-right: 1rem;

    color: ${({ theme }) => theme.colors.Gray1};
    ${({ theme }) => theme.fonts.Body4};
  }

  & > svg {
    cursor: pointer;
  }
`;

const AutoSearchContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;

  width: 100%;
  max-height: 50vh;

  z-index: 3;

  background-color: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
`;

const AutoSearchWrap = styled.ul``;

const AutoSearchData = styled.li`
  display: flex;
  justify-content: space-between;
  position: relative;

  padding: 1rem;
  z-index: 4;

  color: ${({ theme }) => theme.colors.Gray1};
  ${({ theme }) => theme.fonts.Body5};

  a {
    color: ${({ theme }) => theme.colors.Gray2};
    ${({ theme }) => theme.fonts.Body6};
  }

  &:hover {
    background-color: #edf5f5;
    cursor: pointer;
  }
`;
