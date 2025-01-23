import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// 주소를 "경기 양평군"처럼 간단히 표시
const getShortAddress = (fullAddress) => {
  const parts = fullAddress.split(' ');
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }
  return fullAddress;
};

const CardListItem = ({ place }) => {
  const navigate = useNavigate();

  const handleCurationClick = (id) => {
    navigate(`/place/${id}`);
  };

  return (
    <CardContainer onClick={() => handleCurationClick(place.placeId)}>
      {/* 이미지 컨테이너 */}
      <ImageContainer>
        <Image src={place.placeImage} alt={place.name} />
      </ImageContainer>

      {/* 텍스트 컨테이너 */}
      <TextContainer>
        <Title>{place.name}</Title>
        <Address>
          <img src="/src/assets/icons/location.png" alt="location" />
          {getShortAddress(place.address)}
        </Address>
      </TextContainer>
    </CardContainer>
  );
};

export default CardListItem;

const CardContainer = styled.div`
  background-color: #fff;
  display: flex;
  flex-direction: column;
`;

const ImageContainer = styled.div`
  width: 100%;
  height: 240px;
  overflow: hidden;
  border-radius: 10px;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TextContainer = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  ${({ theme }) => theme.fonts.Title6};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const Address = styled.div`
  display: flex;
  align-items: center;
  margin-top: 4px;
  ${({ theme }) => theme.fonts.Body4};
  color: ${({ theme }) => theme.colors.Gray1};

  img {
    width: 12px;
    height: 12px;
    margin-right: 4px;
  }
`;
