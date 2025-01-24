import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import DummyData from '/src/assets/dummy/dummyData';
import Nav from '/src/components/common/Nav';

import DetailHeader from '../common/DetailHeader';
import ContentsInfo from './ContentsInfo';
import FunctionButton from './FunctionButton';
import PlaceInfo from './PlaceInfo';

const PlaceDetail = () => {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const [placeData, setPlaceData] = useState(null);

  useEffect(() => {
    const fetchPlaceData = () => {
      const data = DummyData.find((place) => place.placeId === parseInt(placeId));
      setPlaceData(data);
    };

    fetchPlaceData();
  }, [placeId]);

  if (!placeData) {
    return <Container>Loading...</Container>;
  }

  const handleRoute = () => {
    navigate(`/reviewfeed/${placeId}`);
  };

  return (
    <Container>
      <DetailHeader
        title={placeData.name}
        isOption={false}
        imageSrc={placeData.placeImage}
        imageAltText={placeData.name}
      />

      <Content>
        {/* 장소 관련 작품 정보 */}
        {placeData.additionalInfo.map((info) => (
          <ContentsInfo key={info.contentId} info={info} />
        ))}

        {/* 길찾기, 공유 버튼 */}
        <FunctionButton />

        {/* 장소 상세 정보 */}
        <PlaceInfo placeData={placeData} />

        <BottomContainer>
          <ActionButton onClick={handleRoute}>다른 팬의 인증샷이 궁금하다면?</ActionButton>
        </BottomContainer>
      </Content>

      <Nav />
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

export default PlaceDetail;
