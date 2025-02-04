import React from 'react';
// import { FiCamera, FiFolder } from 'react-icons/fi'; // 아이콘 예시
import styled from 'styled-components';

const ProfileTabMenu = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'posts', label: 'Posts' },
    { id: 'curations', label: 'Curations' },
  ];
  const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);

  return (
    <St.TabMenu>
      {tabs.map((tab) => (
        <St.TabButton
          key={tab.id}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          <St.IconWrapper>{tab.icon}</St.IconWrapper>
          <St.Label>{tab.label}</St.Label>
        </St.TabButton>
      ))}
      <St.Slider activeIndex={activeIndex} />
    </St.TabMenu>
  );
};

export default ProfileTabMenu;

const St = {
  TabMenu: styled.nav`
    position: relative;
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid ${({ theme }) => theme.colors.Gray2 || '#ddd'};
    margin-top: 10px;
  `,
  TabButton: styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'isActive',
  })`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 0;
    border: none;
    background: none;
    cursor: pointer;
    text-align: center;
    font-size: 16px;

    font-weight: ${({ isActive }) => (isActive ? 'bold' : 'normal')};
    color: ${({ theme, isActive }) =>
      isActive ? theme.colors.Gray0 || '#000' : theme.colors.Gray3 || '#aaa'};
  `,
  IconWrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 4px;
    svg {
      width: 20px;
      height: 20px;
    }
  `,
  Label: styled.span`
    font-size: 14px;
  `,
  Slider: styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'activeIndex',
  })`
    position: absolute;
    bottom: 0;
    height: 3px;
    width: 50%;
    background-color: ${({ theme }) => theme.colors.Gray0 || '#000'};
    transition: transform 0.3s ease;
    transform: translateX(${({ activeIndex }) => activeIndex * 100}%);
  `,
};
