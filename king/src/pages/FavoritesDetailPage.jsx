import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { FavoritePeopleDummyData, FavoriteWorksDummyData } from '../assets/dummy/dummyDataArchive';
import { IcBack } from '../assets/icons';
import FavoriteItem from '../components/Archive/FavoriteItem';

const FavoritesDetail = ({ type }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    // 뒤로가기 시 activeTab을 Favorites로 설정
    navigate('/archive', { state: { activeTab: 'Favorites' } });
  };

  const [favoriteWorksData] = useState(FavoriteWorksDummyData);
  const [favoritePeopleData] = useState(FavoritePeopleDummyData);

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
    position: sticky;
    top: 0;
    background-color: ${({ theme }) => theme.colors.White};
    z-index: 10;
    padding: 20px;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
  `,
  Title: styled.div`
    ${({ theme }) => theme.fonts.Title6};
    font-weight: bold;
    padding: 0em 20px;
    display: flex;
    align-items: center;

    position: sticky;
    top: 66.21px;
    background-color: ${({ theme }) => theme.colors.White};
    z-index: 9;
    height: 40px;
    line-height: 60px;
  `,
  List: styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.1rem;
    overflow-y: auto;
    padding: 0 0.5rem;
  `,
  Icon: styled.div`
    padding: 0.7em 0.5em 0 0;
  `,
};
