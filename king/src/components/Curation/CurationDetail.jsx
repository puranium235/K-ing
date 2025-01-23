import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import dummyData from '/src/assets/dummy/dummyData';
import ShareIcon from '/src/assets/icons/send-outline.png';

import DetailHeader from '../common/DetailHeader';
import CardListItem from './CardListItem';

const CurationDetail = () => {
  const navigate = useNavigate();
  const { curationId } = useParams();
  const [places, setPlaces] = useState(dummyData);

  const handleRoute = () => {
    navigate(`/place/${placeId}`);
  };
  return (
    <Container>
      <DetailHeader
        title={'최애의 흔적을 찾아서'}
        isOption={true}
        imageSrc={'/src/assets/dummy/place.png'}
        imageAltText={'CurationImage'}
      />

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
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: calc(100vh + 90px);
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
