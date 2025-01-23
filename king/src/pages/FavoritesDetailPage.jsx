import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { favoritePeopleDummyData, favoriteWorksDummyData } from '../assets/dummy/dummyDataArchive';
import ArchiveTabMenu from '../components/Archive/ArchiveTabMenu';
import FavoriteItem from '../components/Archive/FavoriteItem';
const FavoritesDetail = ({ type }) => {
  const location = useLocation();

  // dummy data (assets/dummy/dummyDataArchive.js)
  const [favoriteWorksData, setFavoriteWorksData] = useState(favoriteWorksDummyData);
  const [favoritePeopleData, setFavoritePeopleData] = useState(favoritePeopleDummyData);

  // Data 선택
  const data = type === 'works' ? favoriteWorksData : favoritePeopleData;

  return (
    <St.Page>
      <St.Header>Archive</St.Header>
      <St.Title>
        {'< '}
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

const StFavoritesDetailPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  padding: 2rem;
  margin-bottom: 7rem;

  h3 {
    width: 100%;
    padding: 1rem 2rem;
    text-align: left;
    ${({ theme }) => theme.fonts.Title3};
  }
`;

const St = {
  Page: styled.div`
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  Header: styled.header`
    position: sticky;
    top: 0;
    background-color: ${({ theme }) => theme.colors.White};
    padding: 10px;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title5};
  `,
  Title: styled.h1`
    ${({ theme }) => theme.fonts.Title};
    font-weight: bold;
  `,
  List: styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 한 줄에 3개 */
    gap: 1px; /* 아이템 간격 */
    justify-items: center; /* 아이템을 가운데 정렬 */
    align-items: center; /* 수직으로도 정렬 */
  `,
};
