import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcStar } from '../../assets/icons';
import { IcStarBlank } from '../../assets/icons';

const FavoritesItem = ({ item, type }) => {
  const navigate = useNavigate();
  const handleBookmarkClick = (event) => {
    event.stopPropagation(); // 부모 클릭 이벤트 방지
    console.log(`${type === 'works' ? item.title : item.name} 북마크 상태 변경`);
  };
  const handleClick = () => {
    // 현재 인물 페이지 없어서 연결 임시로 people로 주었음. 작품도 drama / movie / show 구분을 할 수 없어서 임시로 drama로 넣어둠
    const routeType = type === 'works' ? 'drama' : 'people'; // '작품' -> drama, '인물' -> people
    navigate(`/${routeType}/${item.id}`); // 경로로 이동
  };

  return (
    <St.Item onClick={handleClick}>
      <St.ImageWrapper>
        <St.Image src={item.image} alt={type === 'works' ? item.title : item.name} />
      </St.ImageWrapper>
      <St.Info>
        <St.Text>{type === 'works' ? item.title : item.name}</St.Text>
      </St.Info>
      <St.BookmarkButton onClick={handleBookmarkClick}>
        {item.bookmarked ? (
          <St.Icon>
            <IcStar />
          </St.Icon>
        ) : (
          <St.Icon>
            <IcStarBlank />
          </St.Icon>
        )}
      </St.BookmarkButton>
    </St.Item>
  );
};

export default FavoritesItem;

const St = {
  Item: styled.div`
    position: relative;
    height: 180px;
    flex-shrink: 0;
    background-color: ${({ theme }) => theme.colors.White};
    cursor: pointer; /* 클릭 가능하도록 커서 스타일 변경 */
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
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  Icon: styled.div`
    position: absolute;
    top: 0;
    right: 0;
    /* 별 아이콘 크기 조정 필요 */
    /* width: 15px;
    height: 15px; */
    svg {
      width: 20px;
      height: 20px;
    }
  `,
};
