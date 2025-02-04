import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import Nav from '/src/components/common/Nav';

import { getPlaceDetail } from '../../lib/place';
import DetailHeader from '../common/DetailHeader';
import Loading from '../Loading/Loading';
import ContentsInfo from './ContentsInfo';
import FunctionButton from './FunctionButton';
import PlaceInfo from './PlaceInfo';

const PlaceDetail = () => {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const [placeData, setPlaceData] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const result = await getPlaceDetail(placeId);
        setPlaceData(result);
      } finally {
        setLoading(false);
      }
    };

    fetchPlace();
  }, [placeId]);

  if (loading) return <Loading />;

  const handleRoute = () => {
    navigate(`/reviewfeed/${placeId}`);
  };

  return (
    <Container>
      <DetailHeader
        title={placeData.name}
        isOption={false}
        imageSrc={placeData.imageUrl}
        imageAltText={placeData.name}
      />

      <Content>
        {/* 장소 관련 작품 정보 */}
        {placeData.relatedContents.map((info) => (
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
  height: 100vh;
`;

const Content = styled.div`
  padding: 2rem;
  position: relative;
`;

const BottomContainer = styled.div`
  padding: 2rem 0rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;

  img {
    width: 1.5rem;
  }
`;

const ActionButton = styled.button`
  ${({ theme }) => theme.fonts.Title3};
  background-image: linear-gradient(to right, #0062ff, #71c8ff);
  color: white;
  padding: 1.4rem 2.2rem;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin-bottom: 7rem;

  &:hover {
    background-image: linear-gradient(to right, #71c8ff, #0062ff);
  }
`;

export default PlaceDetail;
