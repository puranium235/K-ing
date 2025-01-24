import React, { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { placeDummyData } from '../../assets/dummy/dummyDataPlace';
import { IcFilter, IcMap } from '../../assets/icons';
import { FilterOption } from '../../recoil/atom';
import BackButton from '../common/BackButton';
import FilterButton from '../common/FilterButton';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import PlaceCard from '../Home/PlaceCard';

const SearchKeyword = () => {
  const navigate = useNavigate();
  const cardsData = placeDummyData;
  const [filter, setFilter] = useRecoilState(FilterOption);

  const [isProvinceActive, setIsProvinceActive] = useState(false);
  const [isCategoryActive, setIsCategoryActive] = useState(false);

  useEffect(() => {
    if (filter && filter.categories) {
      setIsProvinceActive(filter.province !== '');

      setIsCategoryActive(Object.values(filter.categories).some((value) => value));

      // console.log(filter);
    }
  }, [filter]);

  const handleOpenFilter = () => {
    navigate(`/search/keyword/filter`);
  };

  const handleOpenMap = () => {
    navigate(`/map`);
  };

  return (
    <>
      <StHomeWrapper>
        <IconText>
          <BackButton />
          <h3> 장소조회</h3>
        </IconText>
        <SearchBar />
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
            {/* 추후 정렬 컴포넌트 추가 예정 */}
          </Options>
        </OptionHeader>

        <ResultWrapper>
          {cardsData.map((card, index) => (
            <PlaceCard
              key={index}
              image={card.image}
              title={card.title}
              description={card.description}
            />
          ))}
        </ResultWrapper>
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
const OptionHeader = styled.div``;

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
  justify-content: center;
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
