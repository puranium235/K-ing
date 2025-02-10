import { useState } from 'react';
import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcBookmarkBlank } from '../../assets/icons';
import { IcBookmarkFill } from '../../assets/icons';

const CurationItem = forwardRef(({ item }, ref) => {
  const { id: curationId, title, imageUrl, writerNickname, bookmarked: initialBookmarked } = item;
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const navigate = useNavigate();

  const handleBookmarkClick = (event) => {
    event.stopPropagation();
    setBookmarked((prev) => !prev);
  };

  const handleCurationClick = () => {
    navigate(`/curation/${curationId}`);
  };

  return (
    <StCurationItemWrapper ref={ref} onClick={handleCurationClick}>
      <St.Image src={imageUrl} alt={title} />
      <St.Info>
        <St.Author>@{writerNickname}</St.Author>
        <St.Title>{title}</St.Title>
      </St.Info>
      <St.BookmarkButton onClick={handleBookmarkClick}>
        {bookmarked ? <IcBookmarkFill /> : <IcBookmarkBlank />}
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
  Image: styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
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
  `,
  Title: styled.h3`
    margin: 0.4rem 0 0;
    padding-right: 0.5rem;
    ${({ theme }) => theme.fonts.Title7};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  BookmarkButton: styled.button`
    position: absolute;
    top: 0.8rem;
    right: 0.8rem;
    background: none;
    border: none;
    color: ${({ theme }) => theme.colors.White};
    text-shadow: 0 0.2rem 0.4rem rgba(0, 0, 0, 0.5);
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.colors.Gray1};
    }
  `,
};
