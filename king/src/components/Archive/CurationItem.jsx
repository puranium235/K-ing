import { useState } from 'react';
import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcBookmarkBlank, IcBookmarkFill } from '../../assets/icons';
import { removeBookmark } from '../../lib/bookmark';
import { truncateText } from '../../util/truncateText';

const CurationItem = forwardRef(({ item, onRemove }, ref) => {
  const { curationId, title, imageUrl, writerNickname, bookmarked: initialBookmarked } = item; // 초기 bookmarked 값 가져오기
  const [bookmarked, setBookmarked] = useState(initialBookmarked); // 초기 상태를 item.bookmarked로 설정
  const navigate = useNavigate();

  const handleBookmarkClick = async (event) => {
    event.stopPropagation(); // 이벤트 버블링 방지

    const success = await removeBookmark(curationId);
    if (success) {
      onRemove(curationId);
      mutate((prevData) => {
        if (!prevData) return [];

        return prevData.map((page) => ({
          ...page,
          data: {
            ...page.data,
            curations: page.data.curations.filter((curation) => curation.curationId !== curationId),
          },
        }));
      }, false);
    } else {
      setBookmarked(true); // 실패 시 다시 북마크 상태 복구
    }
  };

  const handleCurationClick = () => {
    navigate(`/curation/${curationId}`);
  };

  return (
    <StCurationItemWrapper ref={ref} onClick={handleCurationClick}>
      <St.ImageWrapper>
        <St.Image src={imageUrl} alt={title} />
        <St.GradientOverlay />
      </St.ImageWrapper>
      <St.Info>
        <St.Author>@{truncateText(writerNickname, 15)}</St.Author>
        <St.Title>{truncateText(title, 20)}</St.Title>
      </St.Info>
      <St.BookmarkButton className="drop-shadow" onClick={handleBookmarkClick}>
        {bookmarked ? <IcBookmarkFill /> : <IcBookmarkBlank />} {/* 상태에 따라 아이콘 변경 */}
      </St.BookmarkButton>
    </StCurationItemWrapper>
  );
});

export default CurationItem;

const StCurationItemWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 24rem;
  overflow: hidden;
  box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
  background-color: ${({ theme }) => theme.colors.White};

  cursor: pointer;

  /* transition:
    opacity 0.3s ease-out,
    transform 0.3s ease-out;
  &:hover {
    opacity: 0.9;
  } */
`;

const St = {
  Item: styled.div`
    position: relative;
    width: 100%;
    height: 24rem;
    overflow: hidden;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    background-color: ${({ theme }) => theme.colors.White};
  `,
  ImageWrapper: styled.div`
    position: relative;
    width: 100%;
    height: 100%;
  `,
  Image: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  `,
  GradientOverlay: styled.div`
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30%; /* 그라데이션 적용 범위 조절 */
    background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%);
  `,
  Info: styled.div`
    text-align: left;
    position: absolute;
    bottom: 0.8rem;
    left: 0.8rem;
    color: ${({ theme }) => theme.colors.White};
    text-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.5);
  `,
  Author: styled.p`
    ${({ theme }) => theme.fonts.Body6};
    margin: 0;
    text-overflow: ellipsis;
    max-width: 100%;
  `,
  Title: styled.h3`
    margin: 0.4rem 0 0;
    padding-right: 0.5rem;
    ${({ theme }) => theme.fonts.Title7};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  `,
  BookmarkButton: styled.button`
    position: absolute;
    top: 0.8rem;
    right: 0.8rem;
    background: none;
    border: none;

    cursor: pointer;

    // 북마크 뒤에 그림자
    filter: ${({ theme }) => `drop-shadow(2px 2px 4px ${theme.colors.Yellow}80)`};
  `,
};
