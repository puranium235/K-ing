import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const PlaceCard = ({ place }) => {
  const { id, imageUrl, name } = place;
  const navigate = useNavigate();

  const handleClickPlace = () => {
    navigate(`/place/${id}`);
  };

  return (
    <Card
      onClick={() => {
        handleClickPlace();
      }}
    >
      <CardImage src={imageUrl} alt={name} />
      <CardContent>
        <CardTitle>{name}</CardTitle>
        {/* <CardDescription>{description}</CardDescription> */}
      </CardContent>
    </Card>
  );
};

export default PlaceCard;

const Card = styled.div`
  width: fit-content;
  overflow: hidden;
`;

const CardImage = styled.img`
  width: 90%;
  min-width: 8rem;
  object-fit: cover;

  border-radius: 10px;
`;

const CardContent = styled.div`
  padding: 1rem 0;
  text-align: center;

  background-color: ${({ theme }) => theme.colors.White};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const CardTitle = styled.h3`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  margin: 0;
  ${({ theme }) => theme.fonts.Title7};
`;

const CardDescription = styled.p`
  width: 100%;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  margin: 5px 0 0;
  ${({ theme }) => theme.fonts.Body5};
`;
