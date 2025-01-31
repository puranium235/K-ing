import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import { getCurationDetail } from '../../lib/curation';
import { formatDate } from '../../util/dateFormat';
import DetailHeader from '../common/DetailHeader';
import CardListItem from './CardListItem';
import FunctionButton from './FunctionButton';
import UserProfile from './UserProfile';

const CurationDetail = () => {
  const navigate = useNavigate();
  const { curationId } = useParams();
  const [curationData, setCurationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurationData = async () => {
      try {
        const result = await getCurationDetail(curationId);
        setCurationData(result);
      } finally {
        setLoading(false);
      }
    };

    fetchCurationData();
  }, [curationId]);

  if (loading) return <div>Loading...</div>;

  const handleRoute = () => {
    navigate(`/curation/map/${curationId}`);
  };

  return (
    <Container>
      <DetailHeader
        title={curationData.title}
        isOption={true}
        imageSrc={curationData.imageUrl}
        imageAltText={'CurationImage'}
      />

      {/* 큐레이션 설명 */}
      <Content>
        <UserContainer>
          <UserProfile
            name={curationData.writer.nickname}
            date={formatDate(curationData.createdAt)}
            profileImage={curationData.writer.imageUrl}
          />
          <FunctionButton bookmarked={curationData.bookmarked} />
        </UserContainer>
        <Description>{curationData.description}</Description>
      </Content>

      {/* 장소 모음 */}
      <PlaceList>
        {curationData.places.map((place) => (
          <CardListItem key={place.placeId} place={place} />
        ))}
      </PlaceList>

      <MapButton onClick={handleRoute}>
        <img src="/src/assets/icons/map.png" alt="map" />
      </MapButton>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const Content = styled.div`
  padding: 15px;
  position: relative;
`;

const Description = styled.div`
  padding: 20px 0px;
  ${({ theme }) => theme.fonts.Body2};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const UserContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0px;
`;

const PlaceList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.2rem;
  padding: 0 0.5rem;
`;

const MapButton = styled.button`
  position: absolute;
  bottom: 40px;
  right: 20px;
  background-color: #fff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 1000;

  &:hover {
    background-color: #ccc;
  }

  img {
    width: 25px;
    height: 25px;
    object-fit: contain; /* 이미지가 왜곡되지 않도록 설정 */
  }
`;

export default CurationDetail;
