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
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;

    min-height: 10rem;
    max-height: 15rem;

    width: 7rem;
    background-color: ${({ theme }) => theme.colors.White};
  `,
};

const ImageWrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const Image = styled.img`
  max-width: 10rem;
  object-fit: cover;
`;

const Text = styled.span`
  max-width: 10rem;
  ${({ theme }) => theme.fonts.Body6};
  color: ${({ theme }) => theme.colors.Gray0};
`;
