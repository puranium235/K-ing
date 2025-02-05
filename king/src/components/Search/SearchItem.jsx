import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SearchItem = ({ item }) => {
  const { id, category, name, imageUrl } = item;

  const navigate = useNavigate();

  const handleClick = () => {
    if (category === 'PLACE') {
      navigate(`/place/${id}`);
    } else if (category === 'CAST') {
      navigate(`/content/cast/${id}`);
    } else {
      navigate(`/content/detail/${id}`);
    }
  };

  return (
    <St.Item onClick={handleClick}>
      <ImageWrapper>
        <Image src={imageUrl} alt={name} />
      </ImageWrapper>
      <Text>{name}</Text>
    </St.Item>
  );
};

export default SearchItem;

const St = {
  Item: styled.div`
    cursor: pointer;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;

    gap: 0.5rem;

    min-width: 10.5rem;
    width: 10.5rem;
    background-color: ${({ theme }) => theme.colors.White};
  `,
};

const ImageWrapper = styled.div`
  display: flex;
  justify-content: end;
  width: 100%;
  flex: 8;
  overflow: hidden;
`;

const Image = styled.img`
  width: 100%;
  object-fit: contain;

  overflow: hidden;
`;

const Text = styled.span`
  flex: 2;

  ${({ theme }) => theme.fonts.Body6};
  color: ${({ theme }) => theme.colors.Gray0};
`;
