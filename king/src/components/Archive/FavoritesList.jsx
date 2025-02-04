import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcNavigateNext } from '../../assets/icons';
import FavoriteItem from './FavoriteItem';

const FavoritesList = ({ title, data, onTabChange }) => {
  const navigate = useNavigate();
  // 최대 5개까지만 렌더링
  const previewData = data.slice(0, 5);
  // 단위 계산 ('개' 또는 '명')
  const unit = title === '작품' ? '개' : '명';

  // 전체보기 클릭 시 이동 처리
  const handleFavoriteClick = () => {
    const type = title === '작품' ? 'works' : 'people'; // title에 따라 type 설정
    onTabChange('Favorites'); // activeTab을 Favorites로 설정
    navigate(`/favorites/${type}`, { state: { type } });
  };

  return (
    <StFavoritesListWrapper>
      <St.Header>
        <St.Left>
          <St.Title>{title}</St.Title>
          <St.Count>
            {data.length}
            {unit}의 {title}
          </St.Count>
        </St.Left>
        {data.length > 0 && (
          <St.ShowAllButton onClick={handleFavoriteClick}>
            전체보기 <IcNavigateNext />
          </St.ShowAllButton>
        )}
      </St.Header>
      <St.List>
        {data.length > 0 ? (
          <>
            {previewData.map((item) => (
              <FavoriteItem
                key={item.id}
                item={item}
                type={title === '작품' ? 'works' : 'people'}
              />
            ))}
          </>
        ) : (
          <St.NoDataMessage>아직 즐겨찾기한 {title}이 없어요.</St.NoDataMessage>
        )}

        {data.length > 0 && (
          <St.ShowAllButton2 onClick={handleFavoriteClick}>
            <IcNavigateNext />
            <br />
            전체보기
          </St.ShowAllButton2>
        )}
      </St.List>
    </StFavoritesListWrapper>
  );
};

export default FavoritesList;

const StFavoritesListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`;

const St = {
  Header: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  Left: styled.div`
    display: flex;
    align-items: baseline; /* 제목과 카운트를 정렬 */
    gap: 8px; /* 제목과 카운트 간격 */
    align-items: center; /* 메시지 수직 정렬 */
  `,
  NoDataMessage: styled.div`
    ${({ theme }) => theme.fonts.Body5};
    color: ${({ theme }) => theme.colors.Gray2};
    text-align: center;
    width: 100%;
    padding: 16px 0;
  `,
  Title: styled.h2`
    ${({ theme }) => theme.fonts.Body3};
    font-weight: bold;
  `,
  Count: styled.span`
    ${({ theme }) => theme.fonts.Body6};
    color: ${({ theme }) => theme.colors.Gray2};
  `,
  List: styled.div`
    display: flex;
    overflow-x: auto;
    gap: 8px;

    width: 100%;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
  ShowAllButton: styled.button`
    ${({ theme }) => theme.fonts.Body5};
    display: flex; /* 텍스트와 아이콘을 같은 줄에 배치 */
    align-items: center; /* 텍스트와 아이콘의 높이를 정렬 */
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.Gray0};
    cursor: pointer;
    min-width: 60px; /* 버튼 최소 너비 */
    text-align: center; /* 텍스트 가운데 정렬 */
    text-decoration: none;
    gap: 4px; /* 텍스트와 아이콘 간 간격 */

    &:hover {
      color: ${({ theme }) => theme.colors.MainBlue};
    }
  `,
  ShowAllButton2: styled.button`
    ${({ theme }) => theme.fonts.Body5};
    align-items: center; /* 텍스트와 아이콘의 높이를 정렬 */
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.Gray0};
    cursor: pointer;
    min-width: 60px;
    text-align: center; /* 텍스트 가운데 정렬 */
    text-decoration: none;
    gap: 4px; /* 텍스트와 아이콘 간 간격 */

    /* &:hover {
      color: ${({ theme }) => theme.colors.MainBlue};
    } */
  `,
};
