import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useGetFavoriteList from '../../hooks/archive/useGetFavoriteList';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import BackButton from '../common/button/BackButton';
import GoUpButton from '../common/button/GoUpButton';
import Loading from '../Loading/Loading';
import FavoriteItem from './FavoriteItem';

const FavoritesDetail = () => {
  const { type } = useParams(); // "works" 또는 "people"
  const navigate = useNavigate();
  const lastElementRef = useRef(null);

  const { favoritesList, getNextData, isLoading, hasMore, mutate } = useGetFavoriteList(type);

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  const handleBackClick = () => {
    navigate('/archive');
  };

  // 즐겨찾기 삭제 후 mutate 호출 - 목록 갱신
  const handleRemoveFavorite = (targetId) => {
    mutate((prevData) => {
      if (!prevData) return [];

      return prevData.map((page) => ({
        ...page,
        data: {
          ...page.data,
          favorites: page.data.favorites.filter((favorite) => favorite.targetId !== targetId),
        },
      }));
    }, false);
  };

  if (isLoading && favoritesList.length === 0) return <Loading />;

  return (
    <StFavoritesDetailWrapper>
      <St.FixedContainer>
        <St.Header>Archive</St.Header>
        <St.Title>
          <BackButton onBack={handleBackClick} />
          <St.Label>{type === 'works' ? '작품' : '인물'} 전체보기</St.Label>
        </St.Title>
      </St.FixedContainer>
      <St.List>
        {favoritesList.length > 0 ? (
          favoritesList.map((item, index) => (
            <FavoriteItem
              key={index}
              item={item}
              type={type}
              ref={index === favoritesList.length - 1 ? lastElementRef : null}
              onRemove={handleRemoveFavorite}
            />
          ))
        ) : (
          <St.NoDataMessage>
            아직 즐겨찾기한 {type === 'works' ? '작품' : '인물'}이 없어요.
          </St.NoDataMessage>
        )}
      </St.List>
      <CustomGoUpButton />
      {/* <GoUpButton /> */}
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
    padding: 3rem 3rem 1rem 3rem;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
  `,

  Title: styled.div`
    display: flex;
    align-items: center;
    padding: 1rem 2rem 1rem 1.5rem;

    svg {
      width: 1.6rem;
      height: 1.6rem;
    }
  `,
  Label: styled.div`
    ${({ theme }) => theme.fonts.Title5};
    padding-bottom: 0.3rem;
  `,

  List: styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    overflow-y: auto;
    justify-content: center;
    align-items: center;
    gap: 0;

    padding: 2rem;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
  NoDataMessage: styled.div`
    text-align: center;
    color: ${({ theme }) => theme.colors.Gray2};
    ${({ theme }) => theme.fonts.Body5};
    padding: 2rem;
  `,
  LoadingMessage: styled.div`
    text-align: center;
    padding: 2rem;
    color: ${({ theme }) => theme.colors.Gray2};
    ${({ theme }) => theme.fonts.Body5};
  `,
};

const CustomGoUpButton = styled(GoUpButton)`
  bottom: 2rem;
`;
