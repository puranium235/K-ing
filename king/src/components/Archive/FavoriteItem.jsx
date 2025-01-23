import React from 'react';
import styled from 'styled-components';

import { IcStar } from '../../assets/icons'; // SVG 파일 import

const FavoritesItem = ({ item, type }) => {
  const handleBookmarkClick = () => {
    console.log(`${type === 'works' ? item.title : item.name} 북마크 상태 변경`);
  };

  return (
    <St.Item>
      <St.ImageWrapper>
        <St.Image src={item.image} alt={type === 'works' ? item.title : item.name} />
      </St.ImageWrapper>
      <St.Info>
        <St.Text>{type === 'works' ? item.title : item.name}</St.Text>
      </St.Info>
      <St.BookmarkButton onClick={handleBookmarkClick}>
        <IcStar id="star" fill={item.bookmarked ? '#FFD700' : '#FFFFFF'} /> {/* 노란 별 / 빈 별 */}
      </St.BookmarkButton>
    </St.Item>
  );
};

export default FavoritesItem;

const St = {
  Item: styled.div`
    position: relative;
    width: 120px;
    height: 180px;
    flex-shrink: 0;
    background-color: ${({ theme }) => theme.colors.White};
  `,
  ImageWrapper: styled.div`
    width: 100%;
    height: 100%;
    overflow: hidden;
  `,
  Image: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
  `,
  Info: styled.div`
    position: absolute;
    bottom: 8px;
    left: 8px;
    color: ${({ theme }) => theme.colors.White};
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  `,
  Text: styled.span`
    ${({ theme }) => theme.fonts.Body6};
    font-size: 14px;
    font-weight: bold;
  `,
  BookmarkButton: styled.button`
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover svg {
      fill: ${({ theme }) => theme.colors.Gray1}; /* hover 시 색상 변경 */
    }

    #star {
      position: absolute;
      top: 0;
      right: 0;
    }
  `,
};
