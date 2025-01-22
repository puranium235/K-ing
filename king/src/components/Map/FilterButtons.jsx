import React from "react";
import styled from "styled-components";

const filterIcons = {
  식당: {
    default: "src/assets/icons/restaurant_dark.png",
    active: "src/assets/icons/restaurant.png",
  },
  카페: { default: "src/assets/icons/cafe_dark.png", active: "src/assets/icons/cafe.png" },
  관광: {
    default: "src/assets/icons/playground_dark.png",
    active: "src/assets/icons/playground.png",
  },
  상점: { default: "src/assets/icons/shop_dark.png", active: "src/assets/icons/shop.png" },
  숙박: { default: "src/assets/icons/stay_dark.png", active: "src/assets/icons/stay.png" },
};

const FilterButtons = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <ButtonGroup>
      {filters.map((filter) => (
        <FilterButton
          key={filter}
          $active={activeFilter === filter ? true : false} // 현재 활성화된 필터 확인
          onClick={() => onFilterChange(filter)} // 클릭 이벤트 핸들링
        >
          <img
            src={activeFilter === filter ? filterIcons[filter].active : filterIcons[filter].default}
            alt={filter}
          />
          {filter}
        </FilterButton>
      ))}
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
  font: ${(theme) => theme.fonts.Body3};
  border: 1px solid ${(props, theme) => (props.$active ? theme.colors.MainBlue : "#CAC4D0")};
  border-radius: 8px;
  cursor: pointer;
  color: ${(props, theme) => (props.$active ? "#fff" : theme.colors.Grey1)};
  background-color: ${(props, theme) => (props.$active ? theme.colors.MainBlue : "#fff")};
  transition:
    background-color 0.3s,
    color 0.3s;

  img {
    width: 14px;
    height: 14px;
  }
`;

export default FilterButtons;
