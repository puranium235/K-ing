import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { IcFilter, IcMap } from '../../assets/icons';
import { getSearchResult } from '../../lib/search';
import { FilterOption, SearchQueryState } from '../../recoil/atom';
import BackButton from '../common/BackButton';
import FilterButton from '../common/FilterButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import SortingRow from '../common/SortingRow';
import PlaceCard from '../Home/PlaceCard';

const SearchKeyword = () => {
  const navigate = useNavigate();

  const [filter, setFilter] = useRecoilState(FilterOption);
  const [sortBy, setSortBy] = useState('popularity');

  const [isProvinceActive, setIsProvinceActive] = useState(false);
  const [isCategoryActive, setIsCategoryActive] = useState(false);
  const [results, setResults] = useState(null);

  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');
  const category = searchParams.get('category');

  const setQuery = useSetRecoilState(SearchQueryState);

  const sortType = {
    가나다순: 'name',
    인기순: 'popularity',
    최신순: 'createdAt',
  };

  const getResults = async () => {
    setQuery(query);

    //필터링
    const selectedPlaceType = Object.keys(filter.categories).filter(
      (key) => filter.categories[key],
    );

    // console.log(selectedCategories);

    const res = await getSearchResult({
      query,
      category,
      sortBy,
      // selectedPlaceType ? selectedPlaceType : '',
    });
    setResults(res.results);
    // console.log(res.results);
  };

  useEffect(() => {
    getResults();
  }, [query, filter, sortBy]);

  useEffect(() => {
    if (filter && filter.categories) {
      setIsProvinceActive(filter.province !== '');

      setIsCategoryActive(Object.values(filter.categories).some((value) => value));
    }
  }, [filter]);

  const handleSorting = (newSorting) => {
    setSortBy(sortType[newSorting]);
  };

  const handleOpenFilter = () => {
    navigate(`/search/keyword/filter`);
  };

  const handleOpenMap = () => {
    navigate(`/map`);
  };

  const handleScrollUp = () => {};

  if (!results) {
    return null;
  }

  return (
    <>
      <StHomeWrapper>
        <IconText>
          <BackButton />
          <h3> 장소 조회</h3>
        </IconText>
        <SearchBar query={query || ''} onSearch={() => {}} />
        <OptionHeader>
          <FilterWrapper>
            <FilterButton
              buttonName="필터"
              buttonIcon={IcFilter}
              onClickMethod={handleOpenFilter}
              $isActive={isProvinceActive || isCategoryActive}
            />
            <FilterButton buttonName="장소 유형" $isActive={isCategoryActive} />
            <FilterButton buttonName="지역" $isActive={isProvinceActive} />
          </FilterWrapper>
          <Options>
            <IcMap onClick={handleOpenMap} />
            <SortingRow onSortingChange={handleSorting} />
          </Options>
        </OptionHeader>

        <ResultWrapper>
          {results.map((card, index) => (
            <PlaceCard key={index} place={card} />
          ))}
        </ResultWrapper>
        <UpButton onClick={handleScrollUp}>
          <img src="/src/assets/icons/ic_up.png" alt="up" />
        </UpButton>
        <Nav />
      </StHomeWrapper>
    </>
  );
};

export default SearchKeyword;

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
const OptionHeader = styled.div`
  width: 100%;
`;

const Options = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  margin: 0.5rem;
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;

  gap: 0.5rem;

  margin-bottom: 1rem;
`;

const ResultWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;

  width: 100%;
  padding: 1rem 0;

  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const UpButton = styled.button`
  position: absolute;
  bottom: 9rem;
  right: 20px;
  background-color: #fff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 1000;

  &:hover {
    background-color: #ccc;
  }

  img {
    width: 50px;
    height: 50px;
    object-fit: contain;
  }
`;
