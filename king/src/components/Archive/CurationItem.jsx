import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcBookmarkBlank } from '../../assets/icons';
import { IcBookmarkFill } from '../../assets/icons';

const CurationItem = ({ item }) => {
  const { id, title, image, author, bookmarked: initialBookmarked } = item; // 초기 bookmarked 값 가져오기
  const [bookmarked, setBookmarked] = useState(initialBookmarked); // 초기 상태를 item.bookmarked로 설정
  const navigate = useNavigate();

  const handleBookmarkClick = (event) => {
    event.stopPropagation(); // 이벤트 버블링 방지
    setBookmarked((prev) => !prev); // 북마크 상태 변경 (true <-> false)
  };

  const handleCurationClick = () => {
    navigate(`/curation/${id}`);
  };

  // BE 연결 후 테스트 필요
  // const CurationItem = ({ item, onRemoveBookmark }) => {
  //   const { id, title, image, author, bookmarked } = item;
  //   const navigate = useNavigate();

  //   const handleBookmarkClick = (event) => {
  //     event.stopPropagation();
  //     onRemoveBookmark(id); // ✅ 부모 컴포넌트에서 북마크 해제 처리
  //   };

  //   const handleCurationClick = () => {
  //     navigate(`/curation/${id}`);
  //   };

  return (
    <St.Item onClick={handleCurationClick}>
      <St.Image src={image} alt={title} />
      <St.Info>
        <St.Author>@{author}</St.Author>
        <St.Title>{title}</St.Title>
      </St.Info>
      <St.BookmarkButton onClick={handleBookmarkClick}>
        {bookmarked ? <IcBookmarkFill /> : <IcBookmarkBlank />} {/* 상태에 따라 아이콘 변경 */}
      </St.BookmarkButton>
    </St.Item>
  );
};

export default CurationItem;

const St = {
  Item: styled.div`
    position: relative;
    width: 100%;
    height: 240px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: ${({ theme }) => theme.colors.White};
  `,
  Image: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  `,
  Info: styled.div`
    text-align: left;
    position: absolute;
    bottom: 8px;
    left: 8px;
    color: ${({ theme }) => theme.colors.White};
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  `,
  Author: styled.p`
    ${({ theme }) => theme.fonts.Body6};
    margin: 0;
  `,
  Title: styled.h3`
    margin: 4px 0 0;
    padding-right: 0.5rem;
    ${({ theme }) => theme.fonts.Title7};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  BookmarkButton: styled.button`
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.White};
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.colors.Gray1};
    }
  `,
};
