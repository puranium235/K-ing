import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { regionsDummyData } from '../../assets/dummy/dummyDataPlace';
import { IcRefresh } from '../../assets/icons';
import { FilterOption } from '../../recoil/atom';
import BackButton from '../common/BackButton';

function FilterScreen() {
  const navigate = useNavigate();
  const regions = regionsDummyData;

  const [selectedCategories, setSelectedCategories] = useState({
    restaurant: false,
    cafe: false,
    sight: false,
  });

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [filterOption, setFilterOption] = useRecoilState(FilterOption);

  const handleCheckedState = (category) => {
    setSelectedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleRefresh = () => {
    setSelectedCategories({
      restaurant: false,
      cafe: false,
      sight: false,
    });
    setSelectedProvince('');
  };

  const handleSearchBtn = () => {
    setFilterOption({
      ...filterOption,
      categories: selectedCategories,
      province: selectedProvince,
      district: selectedDistrict,
    });
    navigate('/search/keyword');
  };

  return (
    <FilterWrapper>
      <IconText>
        <BackButton />
        <h3>필터</h3>
      </IconText>
      <FilterContent>
        <Title>장소 유형</Title>
        <CheckboxContainer>
          <label>
            식당
            <input
              type="checkbox"
              checked={selectedCategories.restaurant}
              onChange={() => handleCheckedState('restaurant')}
            />
          </label>
        </CheckboxContainer>
        <CheckboxContainer>
          <label>
            카페
            <input
              type="checkbox"
              checked={selectedCategories.cafe}
              onChange={() => handleCheckedState('cafe')}
            />
          </label>
        </CheckboxContainer>
        <CheckboxContainer>
          <label>
            관광지
            <input
              type="checkbox"
              checked={selectedCategories.sight}
              onChange={() => handleCheckedState('sight')}
            />
          </label>
        </CheckboxContainer>
      </FilterContent>
      <FilterContent>
        <Title>지역</Title>
        <SelectionArea>
          <ProvinceList>
            {Object.keys(regions).map((province) => (
              <ProvinceItem
                key={province}
                onClick={() => {
                  setSelectedProvince(province);
                  setSelectedDistrict('');
                }}
                $isActive={selectedProvince === province}
              >
                {province}
              </ProvinceItem>
            ))}
          </ProvinceList>
          <ProvinceList>
            {selectedProvince &&
              regions[selectedProvince].map((district) => (
                <ProvinceItem
                  key={district}
                  onClick={() => setSelectedDistrict(district)}
                  $isActive={selectedDistrict === district}
                >
                  {district}
                </ProvinceItem>
              ))}
          </ProvinceList>
        </SelectionArea>
      </FilterContent>
      <ButtonWrapper>
        <RefreshButton onClick={handleRefresh}>
          <IcRefresh />
          초기화
        </RefreshButton>
        <Button onClick={handleSearchBtn}>장소 보기</Button>
      </ButtonWrapper>
    </FilterWrapper>
  );
}

export default FilterScreen;

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;

  gap: 2rem;
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

const FilterContent = styled.div`
  height: 100%;
  padding: 1.5rem;

  border: 1px solid ${({ theme }) => theme.colors.Gray2};
  border-radius: 10px;
`;

const Title = styled.h2`
  ${({ theme }) => theme.fonts.Title5};
  margin-bottom: 1.5rem;
`;

const CheckboxContainer = styled.div`
  margin-bottom: 10px;

  label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    ${({ theme }) => theme.fonts.Body2};
    color: ${({ theme }) => theme.colors.Gray1};

    input[type='checkbox'] {
      width: 20px;
      height: 20px;
    }
  }
`;

const SelectionArea = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  text-align: center;
  height: 30rem;
`;

const ProvinceList = styled.div`
  height: 100%;
  overflow-y: scroll;
`;

const ProvinceItem = styled.div`
  padding: 1rem;

  ${({ theme, $isActive }) => ($isActive ? theme.fonts.Title6 : theme.fonts.Body3)};
  color: ${({ theme, $isActive }) => ($isActive ? theme.colors.MainBlue : theme.colors.Gray0)};
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const RefreshButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  color: ${({ theme }) => theme.colors.Gray0};
  ${({ theme }) => theme.fonts.Title4};
`;

const Button = styled.button`
  width: 15rem;
  padding: 1rem 2rem;

  border-radius: 10px;

  background-color: ${({ theme }) => theme.colors.MainBlue};
  color: ${({ theme }) => theme.colors.White};
  ${({ theme }) => theme.fonts.Title4};
`;
