import React from 'react';
import styled from 'styled-components';

import CafeIcon from '../../assets/icons/cafe.png';
import CafeDarkIcon from '../../assets/icons/cafe_dark.png';
import PlaygroundIcon from '../../assets/icons/playground.png';
import PlaygroundDarkIcon from '../../assets/icons/playground_dark.png';
import RestaurantIcon from '../../assets/icons/restaurant.png';
import RestaurantDarkIcon from '../../assets/icons/restaurant_dark.png';
import ShopIcon from '../../assets/icons/shop.png';
import ShopDarkIcon from '../../assets/icons/shop_dark.png';
import StayIcon from '../../assets/icons/stay.png';
import StayDarkIcon from '../../assets/icons/stay_dark.png';

const filterMap = {
  RESTAURANT: '식당',
  CAFE: '카페',
  PLAYGROUND: '관광',
  STORE: '상점',
  STAY: '숙박',
};

const filterIcons = {
  RESTAURANT: {
    default: RestaurantDarkIcon,
    active: RestaurantIcon,
  },
  CAFE: { default: CafeDarkIcon, active: CafeIcon },
  PLAYGROUND: {
    default: PlaygroundDarkIcon,
    active: PlaygroundIcon,
  },
  STORE: { default: ShopDarkIcon, active: ShopIcon },
  STAY: { default: StayDarkIcon, active: StayIcon },
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
  color: ${(props) => (props.$active ? '#fff' : props.theme.colors.Gray1)};
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
