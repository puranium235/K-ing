import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import dummyData from '/src/assets/dummy/dummyData';

import DetailHeader from '../common/DetailHeader';
import CardListItem from './CardListItem';
import FunctionButton from './FunctionButton';
import UserProfile from './UserProfile';

const CurationDetail = () => {
  const { curationId } = useParams();
  const [places, setPlaces] = useState(dummyData);

  const curationData = {
    id: 1,
    image_url: '/src/assets/dummy/curationimg.png',
    user_id: 'k-ing_Official',
    title: '최애의 흔적을 찾아서 : BTS의 RM편입니드아아아아아아아',
    description:
      '안녕하세요! 오늘은 방탄소년단 RM이 다녀간 멋진 장소들을 소개하려고 해요. 예술과 자연을 사랑하는 RM의 취향을 엿볼 수 있는 곳들이라, 꼭 한 번쯤 가보고 싶더라고요. 그의 인스타그램이나 인터뷰 속에서 자주 언급된 핫플레이스들인데요, RM처럼 여유를 느끼며 산책하고, 감성을 채울 수 있는 공간들로 골라봤어요. 그럼, RM의 발자취를 따라 떠나볼까요? 😊',
    updated_at: '2025.01.15',
    bookmarked: true,
  };

  return (
    <Container>
      <DetailHeader
        title={curationData.title}
        isOption={true}
        imageSrc={curationData.image_url}
        imageAltText={'CurationImage'}
      />

      {/* 큐레이션 설명 */}
      <Content>
        <UserContainer>
          <UserProfile
            name={curationData.user_id}
            date={curationData.updated_at}
            profileImage="/src/assets/dummy/curationimg.png"
          />
          <FunctionButton bookmarked={curationData.bookmarked} />
        </UserContainer>
        <Description>{curationData.description}</Description>
      </Content>

      {/* 장소 모음 */}
      <PlaceList>
        {places.map((place) => (
          <CardListItem key={place.placeId} place={place} />
        ))}
      </PlaceList>
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

export default CurationDetail;
