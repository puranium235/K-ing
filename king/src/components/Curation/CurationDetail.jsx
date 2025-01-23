import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import dummyData from '../assets/dummy/dummyData';
import placeImage from '../assets/dummy/place.png';
import BackIcon from '../assets/icons/icon-back.png';
import OptionIcon from '../assets/icons/option.png';
import ShareIcon from '../assets/icons/send-outline.png';
import OptionModal from '../components/common/OptionModal';
import CardListItem from '../components/Curation/CardListItem';

const CurationDetail = () => {
  const navigate = useNavigate();
  const { curationId } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [places, setPlaces] = useState(dummyData);

  const handleClose = () => {
    navigate(-1);
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handleRoute = () => {
    navigate(`/place/${placeId}`);
  };
  return (
    <Container>
      {/* 헤더 */}
      <Header>
        <BackButton onClick={handleClose}>
          <img src={BackIcon} alt="Back" />
        </BackButton>
        <Title>최애의 흔적을 찾아서</Title>
        <OptionButton onClick={openModal}>
          <img src={OptionIcon} alt="Option" />
        </OptionButton>
      </Header>
      <ImageContainer>
        <img src={placeImage} alt="MainImage" />
      </ImageContainer>

      {/* 큐레이션 설명 */}
      <Content>
        <ButtonContainer>
          <ShareButton>
            <img src={ShareIcon} alt="Share" />
            공유
          </ShareButton>
        </ButtonContainer>
        <TextContainer>
          안녕하세요! 오늘은 방탄소년단 RM이 다녀간 멋진 장소들을 소개하려고 해요. 예술과 자연을
          사랑하는 RM의 취향을 엿볼 수 있는 곳들이라, 꼭 한 번쯤 가보고 싶더라고요. 그의
          인스타그램이나 인터뷰 속에서 자주 언급된 핫플레이스들인데요, RM처럼 여유를 느끼며
          산책하고, 감성을 채울 수 있는 공간들로 골라봤어요. 그럼, RM의 발자취를 따라 떠나볼까요? 😊
        </TextContainer>

        {/* 장소 모음 */}
        <ListContainer>
          {places.map((place) => (
            <CardListItem key={place.placeId} {...place} />
          ))}
        </ListContainer>
      </Content>

      {/* 모달 */}
      <OptionModal isModalVisible={isModalVisible} onClick={closeModal} />
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

const OptionButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;

  img {
    height: 18px;
  }
`;

const Title = styled.h1`
  ${({ theme }) => theme.fonts.Title3};
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

const TextContainer = styled.div`
  padding: 20px;
  position: relative;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 0px;
  gap: 10px;
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

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  background-color: #f2f2f2;
`;

export default CurationDetail;
