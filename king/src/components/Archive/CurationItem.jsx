import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcBookmarkBlank } from '../../assets/icons';
import { IcBookmarkFill } from '../../assets/icons';

const CurationItem = ({ item }) => {
  const navigate = useNavigate();

  const handleBookmarkClick = (event) => {
    event.stopPropagation(); // 부모 클릭 이벤트 방지
    console.log(`${item.title} 북마크 상태 변경`);
  };

  const handleCurationClick = (id) => {
    navigate(`/curation/${id}`);
  };

  return (
    <St.Item onClick={() => handleCurationClick(item.id)}>
      <St.Image src={item.image} alt={item.title} />
      <St.Info>
        <St.Author>@{item.author}</St.Author>
        <St.Title>{item.title}</St.Title>
      </St.Info>
      <St.BookmarkButton onClick={handleBookmarkClick}>
        {item.bookmarked ? <IcBookmarkFill /> : <IcBookmarkBlank />}
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
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 카드 그림자 */
    background-color: ${({ theme }) => theme.colors.White};
  `,
  Image: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover; /* 이미지가 카드 크기에 맞게 조정 */
    display: block; /* 기본 여백 제거 */
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
