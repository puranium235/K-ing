import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import DummyData from '../../assets/dummy/dummyData';
import CloseButton from '../common/CloseButton';
import Nav from '../common/Nav';
import ContentsInfo from '../PlaceDetail/ContentsInfo';
import FunctionButton from '../PlaceDetail/FunctionButton';
import PlaceInfo from '../PlaceDetail/PlaceInfo';
import GoogleMapView from './GoogleMapView';

const MapCurationPlaces = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { curationId } = useParams();
  const [places, setPlaces] = useState(DummyData);

  const toggleBox = () => {
    setIsExpanded(!isExpanded);
  };

  const [placeId, setPlaceId] = useState(places[0].placeId);
  const [placeData, setPlaceData] = useState(null);

  useEffect(() => {
    const fetchPlaceData = () => {
      const data = places.find((place) => place.placeId === parseInt(placeId));
      setPlaceData(data);
    };

    fetchPlaceData();
  }, [placeId]);

  if (!placeData) {
    return <Container>Loading...</Container>;
  }

  const { name, placeImage } = placeData;

  const handleMarkerClick = (placeId) => {
    setPlaceId(placeId);
  };

  return (
    <Container>
      {/* Map Section */}
      <MapSection>
        <GoogleMapView places={places} isSearch={false} onMarkerClick={handleMarkerClick} />
      </MapSection>

      {/* Content Section */}
      <ContentSection $isExpanded={isExpanded}>
        <SlideBar onClick={toggleBox} />

        <Content>
          <Title>{name}</Title>

          {placeImage && <Image src={placeImage} alt={name} />}
          {/* 장소 관련 작품 정보 */}
          {placeData.additionalInfo.map((info) => (
            <ContentsInfo key={info.contentId} info={info} />
          ))}

          {/* 길찾기, 공유 버튼 */}
          <FunctionButton />

          {/* 장소 상세 정보 */}
          <PlaceInfo placeData={placeData} />
        </Content>
      </ContentSection>

      <CloseButton />
      <Nav />
    </Container>
  );
};

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MapSection = styled.div`
  position: relative;
  height: calc(100vh - 380px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SlideBar = styled.div`
  width: 60px;
  height: 3px;
  background-color: #cbcbcb;
  border-radius: 2.5px;
  margin: 10px auto;
  margin-bottom: 20px;
  cursor: pointer;
`;

const ContentSection = styled.div`
  background-color: #ffffff;
  height: 100%;
  position: absolute;
  ${(props) => (props.$isExpanded ? 'top: 90px;' : 'top: calc(100vh - 400px);')}
  left: 0;
  right: 0;
  transition: bottom 0.3s ease;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  z-index: 1001;
`;

const Content = styled.div`
  padding: 10px 20px;
  position: relative;
`;

const Title = styled.div`
  ${({ theme }) => theme.fonts.Title3};
  white-space: nowrap;
  overflow-x: auto; /* 캐러셀 효과 */
  scrollbar-width: none; /* 스크롤바 제거 (Firefox) */
  -ms-overflow-style: none; /* 스크롤바 제거 (IE/Edge) */

  &::-webkit-scrollbar {
    display: none; /* 스크롤바 제거 (Chrome/Safari) */
  }
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 20px 0px;
`;

export default MapCurationPlaces;
