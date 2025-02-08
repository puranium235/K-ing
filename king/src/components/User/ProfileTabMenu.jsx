import React from 'react';
import styled from 'styled-components';

import { IcPosts, IcPostsWhite } from '../../assets/icons';
import { IcArchiveBox, IcArchiveBoxWhite } from '../../assets/icons';

const ProfileTabMenu = ({ activeTab, onTabChange }) => {
  return (
    <St.TabMenu>
      {[
        {
          id: 'posts',
          label: 'Posts',
          activeIcon: <IcPosts />,
          inactiveIcon: <IcPostsWhite />,
        },
        {
          id: 'curations',
          label: 'Curations',
          activeIcon: <IcArchiveBox />,
          inactiveIcon: <IcArchiveBoxWhite />,
        },
      ].map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <St.TabButton key={tab.id} isActive={isActive} onClick={() => onTabChange(tab.id)}>
            <St.IconWrapper>{isActive ? tab.activeIcon : tab.inactiveIcon}</St.IconWrapper>
            <St.Label>{tab.label}</St.Label>
          </St.TabButton>
        );
      })}
      <St.Slider activeIndex={activeTab === 'curations' ? 1 : 0} />
    </St.TabMenu>
  );
};

export default ProfileTabMenu;

const St = {
  TabMenu: styled.nav`
    position: relative;
    display: flex;
    justify-content: space-between;
    border-bottom: 0.2rem solid ${({ theme }) => theme.colors.Gray2 || '#ddd'};
    margin-top: 1rem;
  `,
  TabButton: styled.button.withConfig({
    shouldForwardProp: (prop) => prop !== 'isActive',
  })`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 0;
    border: none;
    background: none;
    cursor: pointer;
    text-align: center;
    font-size: 1.6rem;

    font-weight: ${({ isActive }) => (isActive ? 'bold' : 'normal')};
    color: ${({ theme, isActive }) =>
      isActive ? theme.colors.Gray0 || '#000' : theme.colors.Gray3 || '#aaa'};
  `,
  IconWrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 0.4rem;
    svg {
      width: 2rem;
      height: 2rem;
    }
  `,
  Label: styled.span`
    font-size: 1.4rem;
  `,
  Slider: styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== 'activeIndex',
  })`
    position: absolute;
    bottom: 0;
    height: 0.3rem;
    width: 50%;
    background-color: ${({ theme }) => theme.colors.Gray0 || '#000'};
    transition: transform 0.3s ease;
    transform: translateX(${({ activeIndex }) => activeIndex * 100}%);
  `,
};
