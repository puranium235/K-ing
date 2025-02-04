import React from 'react';
import styled from 'styled-components';

const filterMap = {
  RESTAURANT: '식당',
  CAFE: '카페',
  PLAYGROUND: '관광',
  STORE: '상점',
  STAY: '숙박',
};

const filterIcons = {
  RESTAURANT: {
    default: '/src/assets/icons/restaurant_dark.png',
    active: '/src/assets/icons/restaurant.png',
  },
  CAFE: { default: '/src/assets/icons/cafe_dark.png', active: '/src/assets/icons/cafe.png' },
  PLAYGROUND: {
    default: '/src/assets/icons/playground_dark.png',
    active: '/src/assets/icons/playground.png',
  },
  STORE: { default: '/src/assets/icons/shop_dark.png', active: '/src/assets/icons/shop.png' },
  STAY: { default: '/src/assets/icons/stay_dark.png', active: '/src/assets/icons/stay.png' },
};

const FilterButtons = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <ButtonGroup>
      {filters.map((filter) => {
        const isActive = activeFilter[filter]; // 필터가 활성 상태인지 확인

        return (
          <FilterButton key={filter} $active={isActive} onClick={() => onFilterChange(filter)}>
            <img
              src={isActive ? filterIcons[filter].active : filterIcons[filter].default}
              alt={filter}
            />
            {filterMap[filter]}
          </FilterButton>
        );
      })}
    </ButtonGroup>
  );
};

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  background-color: #fff;
  overflow-x: auto; /* 캐러셀 효과 */
  scrollbar-width: none; /* 스크롤바 제거 (Firefox) */
  -ms-overflow-style: none; /* 스크롤바 제거 (IE/Edge) */

  &::-webkit-scrollbar {
    display: none; /* 스크롤바 제거 (Chrome/Safari) */
  }
`;

const FilterButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 70px;
  height: 32px;
  white-space: nowrap;
  padding: 8px;
  ${({ theme }) => theme.fonts.Body3};
  border: 1px solid ${(props) => (props.$active ? props.theme.colors.MainBlue : '#CAC4D0')};
  border-radius: 8px;
  cursor: pointer;
  color: ${(props) => (props.$active ? '#fff' : props.theme.colors.Grey1)};
  background-color: ${(props) => (props.$active ? props.theme.colors.MainBlue : '#fff')};
  transition:
    background-color 0.3s,
    color 0.3s;

  img {
    width: 14px;
    height: 14px;
  }
`;

export default FilterButtons;
