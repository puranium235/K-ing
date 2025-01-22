import React from "react";
import styled from "styled-components";

const PlaceCard = ({ image, title, description }) => {
  return (
    <Card>
      <CardImage src={image} alt={title} />
      <CardContent>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default PlaceCard;

const Card = styled.div`
  min-width: 158px;
  overflow: hidden;
`;

const CardImage = styled.img`
  width: 100%;
  object-fit: cover;
`;

const CardContent = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.colors.White};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const CardTitle = styled.h3`
  margin: 0;
  ${({ theme }) => theme.fonts.Title7};
`;

const CardDescription = styled.p`
  margin: 5px 0 0;
  ${({ theme }) => theme.fonts.Body5};
`;
