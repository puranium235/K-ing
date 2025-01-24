import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { favoritePeopleDummyData, favoriteWorksDummyData } from '../assets/dummy/dummyDataArchive';
import { IcBack } from '../assets/icons';
import FavoriteItem from '../components/Archive/FavoriteItem';

const FavoritesDetail = ({ type }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    // 뒤로가기 시 activeTab을 Favorites로 설정
    navigate('/archive', { state: { activeTab: 'Favorites' } });
  };

  const [favoriteWorksData] = useState(favoriteWorksDummyData);
  const [favoritePeopleData] = useState(favoritePeopleDummyData);

  const data = type === 'works' ? favoriteWorksData : favoritePeopleData;

  return (
    <St.Page>
      <St.Header>Archive</St.Header>
      <St.Title>
        <St.Icon onClick={handleBackClick}>
          <IcBack />
        </St.Icon>
        {type === 'works' ? '작품' : '인물'} 전체보기
      </St.Title>
      <St.List>
        {data.map((item) => (
          <FavoriteItem key={item.id} item={item} type={type} />
        ))}
      </St.List>
    </St.Page>
  );
};

export default FavoritesDetail;

const St = {
  Page: styled.div`
    display: flex;
    flex-direction: column;
  `,
  Header: styled.header`
    /* position: sticky; */
    /* top: 0; */
    background-color: ${({ theme }) => theme.colors.White};
    z-index: 10;

    padding: 2rem 2rem 0 2rem;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
  `,
  Title: styled.div`
    ${({ theme }) => theme.fonts.Title6};
    font-weight: bold;
    display: flex;
    align-items: center;

    padding: 1rem 2rem 1rem 2rem;

    /* position: sticky; */
    /* top: 66.21px; */
    background-color: ${({ theme }) => theme.colors.White};
    z-index: 9;
    /* height: 40px; */
    /* line-height: 60px; */
  `,
  List: styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    overflow-y: auto;
    padding: 0 1rem;

    height: calc(100vh - 10rem);

    &::-webkit-scrollbar {
      display: none;
    }
  `,
  Icon: styled.div`
    padding: 0.7em 0.5em 0 0;
  `,
};
