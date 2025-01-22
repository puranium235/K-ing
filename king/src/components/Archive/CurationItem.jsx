import styled from "styled-components";

const CurationItem = ({ item }) => {
  const handleBookmarkClick = () => {
    console.log(`${item.title} 북마크 상태 변경`);
  };

  return (
    <St.Item>
      <St.Image src={item.image} alt={item.title} />
      <St.Info>
        <St.Author>@{item.author}</St.Author>
        <St.Title>{item.title}</St.Title>
      </St.Info>
      <St.BookmarkButton onClick={handleBookmarkClick}>
        {item.bookmarked ? "★" : "☆"}
      </St.BookmarkButton>
    </St.Item>
  );
};

export default CurationItem;

const St = {
  Item: styled.div`
    position: relative;
    width: 180px;
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
    position: absolute;
    bottom: 8px;
    left: 8px;
    color: ${({ theme }) => theme.colors.White};
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5); /* 텍스트 가독성 향상 */
  `,
  Author: styled.p`
    ${({ theme }) => theme.fonts.Body6};
    margin: 0;
  `,
  Title: styled.h3`
    ${({ theme }) => theme.fonts.Body4};
    font-weight: bold;
    margin: 4px 0 0;
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
