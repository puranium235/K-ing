import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import {
  FavoritePeopleDummyData,
  FavoriteWorksDummyData,
} from '../../assets/dummy/dummyDataArchive';
import BackButton from '../common/button/BackButton';
import FavoriteItem from './FavoriteItem';

const FavoritesDetail = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const handleBackClick = () => {
    // 뒤로가기 시 activeTab을 Favorites로 설정
    navigate('/archive', { state: { activeTab: 'Favorites' } });
  };

  const [favoriteWorksData] = useState(FavoriteWorksDummyData);
  const [favoritePeopleData] = useState(FavoritePeopleDummyData);

  const data = type === 'works' ? favoriteWorksData : favoritePeopleData;

  return (
    <StFavoritesDetailWrapper>
      <St.FixedContainer>
        <St.Header>Archive</St.Header>
        <St.Title>
          <BackButton onBack={handleBackClick} />
          {type === 'works' ? '작품' : '인물'} 전체보기
        </St.Title>
      </St.FixedContainer>
      <St.List>
        {data.map((item) => (
          <FavoriteItem key={item.id} item={item} type={type} />
        ))}
      </St.List>
    </StFavoritesDetailWrapper>
  );
};

export default FavoritesDetail;

const StFavoritesDetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const St = {
  FixedContainer: styled.div`
    position: sticky;
    top: 0;
    z-index: 1000;
    background-color: ${({ theme }) => theme.colors.White};
  `,

  Header: styled.header`
    background-color: ${({ theme }) => theme.colors.White};
    padding: 2rem 2rem 0 2rem;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
  `,

  Title: styled.div`
    ${({ theme }) => theme.fonts.Title5};
    font-weight: bold;
    display: flex;
    align-items: center;
    padding: 1rem 2rem 1rem 1.5rem;
    gap: 0.5rem;

    svg {
      width: 1.6rem;
      height: 1.6rem;
    }

    background-color: ${({ theme }) => theme.colors.White};
  `,

  List: styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    overflow-y: auto;
    padding: 0 1rem;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
};
