import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import dummyData from '../assets/dummy/dummyData';
import placeImage from '../assets/dummy/place.png';
import BadIcon from '../assets/icons/bad.png';
import ClockIcon from '../assets/icons/clock.png';
import GoodIcon from '../assets/icons/good.png';
import BackIcon from '../assets/icons/icon-back.png';
import LocationIcon from '../assets/icons/location.png';
import PenIcon from '../assets/icons/pen.png';
import PhoneIcon from '../assets/icons/phone.png';
import RouteIcon from '../assets/icons/route.png';
import ShareIcon from '../assets/icons/send-outline.png';
import DeepLinkModal from '../components/common/DeepLinkModal';
import Nav from '../components/common/Nav';

const PlaceDetailPage = () => {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const [placeData, setPlaceData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchPlaceData = () => {
      const data = dummyData.find((place) => place.placeId === parseInt(placeId));
      setPlaceData(data);
    };

    fetchPlaceData();
  }, [placeId]);

  if (!placeData) {
    return <Container>Loading...</Container>;
  }

  const handleClose = () => {
    navigate(-1);
  };

  const handleRoute = () => {
    navigate(`/reviewfeed/${placeId}`);
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const isAlwaysOpen = placeData.closedDays === '연중무휴'; // 연중무휴 여부 확인

  return (
    <Container>
      <Header>
        <BackButton onClick={handleClose}>
          <img src={BackIcon} alt="Back" />
        </BackButton>
        <Title>{placeData.name}</Title>
      </Header>
      <ImageContainer>
        <img src={placeImage} alt={placeData.name} />
      </ImageContainer>
      <Content>
        {placeData.additionalInfo.map((info, index) => (
          <InfoContainer key={index}>
            <InfoRow>
              <InfoTitle>{info.name}</InfoTitle>
              <InfoType>{info.type}</InfoType>
            </InfoRow>
            <Description>{info.description}</Description>
          </InfoContainer>
        ))}
        <ButtonContainer>
          <DirectionButton onClick={openModal}>
            <img src={RouteIcon} alt="FindRoute" />
            길찾기
          </DirectionButton>
          <ShareButton>
            <img src={ShareIcon} alt="Share" />
            공유
          </ShareButton>
        </ButtonContainer>
        <DetailContainer>
          <ImportantInfoItem $isAlwaysOpen={isAlwaysOpen}>
            <img
              src={isAlwaysOpen ? GoodIcon : BadIcon}
              alt={isAlwaysOpen ? 'Always Open' : 'Closed'}
            />
            {placeData.closedDays}
          </ImportantInfoItem>
          <Details>
            <img src={LocationIcon} alt="Location" /> &nbsp; {placeData.address}
          </Details>
          {!isAlwaysOpen && (
            <Details>
              <img src={ClockIcon} alt="Clock" /> &nbsp; {placeData.closedDays} 휴무
            </Details>
          )}
          <Details>
            <img src={ClockIcon} alt="Clock" /> &nbsp; {placeData.openHours}
          </Details>
          <Details>
            <img src={PhoneIcon} alt="Phone" /> &nbsp; {placeData.phone}
          </Details>
          <Details>
            <img src={PenIcon} alt="Pen" /> &nbsp; {'2025.01.22'}
          </Details>
        </DetailContainer>
        <BottomContainer>
          <ActionButton onClick={handleRoute}>다른 팬의 인증샷이 궁금하다면?</ActionButton>
        </BottomContainer>
      </Content>

      <DeepLinkModal isModalVisible={isModalVisible} onClick={closeModal} />

      <Nav />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: calc(100vh + 90px);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 10px;
  gap: 10px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;

  img {
    width: 8px;
  }
`;

const Title = styled.h1`
  ${({ theme }) => theme.fonts.Title3};
  margin: 0;
`;

const ImageContainer = styled.div`
  position: relative;
  border-radius: 0px 0px 16px 16px;
  overflow: hidden;

  img {
    width: 100%;
    height: 250px;
  }
`;

const Content = styled.div`
  padding: 20px;
  position: relative;
`;

const InfoContainer = styled.div`
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InfoTitle = styled.h2`
  ${({ theme }) => theme.fonts.Title5};
  margin: 0;
`;

const InfoType = styled.span`
  color: #949494;
  ${({ theme }) => theme.fonts.Body3};
`;

const Description = styled.p`
  ${({ theme }) => theme.fonts.Body2};
  color: #555;
  margin: 5px 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 0px;
  gap: 10px;
`;

const DirectionButton = styled.button`
  ${({ theme }) => theme.fonts.Body2};
  background-color: ${({ theme }) => theme.colors.Gray0};
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 70px;
  height: 34px;
  white-space: nowrap;
  padding: 12px;
  border: none;
  border-radius: 16px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.Gray1};
  }

  img {
    width: 14px;
    height: 14px;
  }
`;

const ShareButton = styled.button`
  ${({ theme }) => theme.fonts.Body2};
  background-color: ${({ theme }) => theme.colors.Gray5};
  color: ${({ theme }) => theme.colors.Gray0};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 70px;
  height: 34px;
  white-space: nowrap;
  padding: 12px;
  border: none;
  border-radius: 16px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.Gray3};
  }

  img {
    width: 14px;
    height: 14px;
  }
`;

const DetailContainer = styled.div`
  padding: 20px 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;

  img {
    width: 15px;
  }
`;

const Details = styled.div`
  ${({ theme }) => theme.fonts.Body2};
  color: ${({ theme }) => theme.colors.Gray1};
`;

const ImportantInfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  ${({ theme }) => theme.fonts.Title5};
  color: ${(props) =>
    props.$isAlwaysOpen ? '#17A600' : props.theme.colors.Red}; /* 연중무휴일 때 색상 변경 */

  img {
    width: 16px;
    height: 16px;
  }
`;

const BottomContainer = styled.div`
  padding: 20px 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;

  img {
    width: 15px;
  }
`;

const ActionButton = styled.button`
  ${({ theme }) => theme.fonts.Title3};
  background-image: linear-gradient(to right, #0062ff, #71c8ff);
  color: white;
  padding: 14px 22px;
  border: none;
  border-radius: 20px;
  cursor: pointer;

  &:hover {
    background-image: linear-gradient(to right, #71c8ff, #0062ff);
  }
`;

export default PlaceDetailPage;
