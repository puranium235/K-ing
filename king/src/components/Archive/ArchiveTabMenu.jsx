import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { IcArchiveBox } from '../../assets/icons';
import { IcStar2 } from '../../assets/icons';

const ArchiveTabMenu = ({ activeTab, onTabChange }) => {
  const handleTabClick = (tab) => {
    console.log(`Tab clicked: ${tab}`); // 클릭 확인
    onTabChange(tab);
  };

  const tabs = [
    { id: 'Curations', label: 'Curations', icon: <IcArchiveBox /> },
    { id: 'Favorites', label: 'Favorites', icon: <IcStar2 /> },
  ];
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <St.TabMenu>
      {tabs.map((tab) => (
        <St.TabButton
          key={tab.id}
          isActive={activeTab === tab.id} // 활성화 상태 전달
          onClick={() => handleTabClick(tab.id)}
        >
          <St.IconWrapper>{tab.icon}</St.IconWrapper>
          <St.Label>{tab.label}</St.Label>
        </St.TabButton>
      ))}
      <St.Slider activeIndex={activeIndex} />
    </St.TabMenu>
  );
};

export default ArchiveTabMenu;

const St = {
  TabMenu: styled.nav`
    position: relative;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid ${({ theme }) => theme.colors.Gray2};
  `,
  TabButton: styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'isActive', // isActive를 DOM에 전달하지 않음
  })`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
    border: none;
    background: none;
    cursor: pointer;
    text-align: center;
    ${({ theme }) => theme.fonts.Body1};

    /* 활성화 상태에 따른 스타일 */
    font-weight: ${({ isActive }) => (isActive ? 'bold' : 'normal')};
    color: ${({ theme, isActive }) => (isActive ? theme.colors.Gray0 : theme.colors.Gray3)};
  `,
  IconWrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 4px; /* 아이콘과 텍스트 간격 */
    svg {
      width: 20px; /* 아이콘 크기 */
      height: 20px;
    }
  `,
  Label: styled.span``,
  Slider: styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'activeIndex', // activeIndex를 DOM에 전달하지 않음
  })`
    position: absolute;
    bottom: 0;
    height: 2px;
    width: 50%; /* 각 탭의 너비 */
    background-color: ${({ theme }) => theme.colors.Gray0};
    transition: transform 0.3s ease;
    transform: translateX(${({ activeIndex }) => activeIndex * 100}%);
  `,
};
