import React from 'react';
import styled from 'styled-components';

import { IcMarker, IcStar } from '../../assets/icons';
import BackButton from '../common/BackButton';

const DramaDetails = () => {
  return (
    <DramaPageContainer>
      <IconText>
        <BackButton />
        <h3> 세부정보</h3>
      </IconText>

      <Header>
        <img id="poster" src="/src/assets/dummy/poster1.png" alt="Drama Poster" />
        <TitleSection>
          <h3>도깨비</h3>
          <IconText>
            <img src="/src/assets/icons/location.png" alt="marker" />
            <p>드라마</p>
          </IconText>
          <IconText>
            <img src="/src/assets/icons/location.png" alt="marker" />
            <p>tvN</p>
          </IconText>
        </TitleSection>
        <IcStar id="favor" />
      </Header>

      <Synopsis>
        <IconText>
          <img src="/src/assets/icons/location.png" alt="marker" />
          <p>소개</p>
        </IconText>
        불멸의 삶을 끝내기 위해 인간 신부가 필요한 도깨비, 그와 기묘한 동거를 시작한 기억상실증
        저승사자. 그런 그들 앞에 '도깨비 신부' 라 주장하는 '죽었어야 할 운명'의 소녀가 나타나며
        벌어지는 신비로운 낭만 설화
      </Synopsis>

      <IconText>
        <img src="/src/assets/icons/location.png" alt="marker" />
        <p>등장인물</p>
      </IconText>
      <CastGrid>
        <CastMember>
          <img src="/src/assets/dummy/celeb1.png" alt="Cast Member" />
          <p>공유</p>
        </CastMember>
        <CastMember>
          <img src="/src/assets/dummy/celeb2.png" alt="Cast Member" />
          <p>김고은</p>
        </CastMember>
        <CastMember>
          <img src="/src/assets/dummy/celeb3.png" alt="Cast Member" />
          <p>이동욱</p>
        </CastMember>
        <CastMember>
          <img src="/src/assets/dummy/celeb4.png" alt="Cast Member" />
          <p>유인나</p>
        </CastMember>
      </CastGrid>
      <ActionButton>
        <IcMarker />
        <p>촬영지 알아보기</p>
      </ActionButton>
    </DramaPageContainer>
  );
};

export default DramaDetails;

const DramaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  padding: 20px;
  background-color: #fff;

  h3 {
    width: 100%;
    padding: 1rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title3};
  }
`;

const Header = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: end;
  margin-bottom: 20px;

  #poster {
    width: 60%;
    margin-right: 2rem;
  }

  #favor {
    position: absolute;
    right: 0;
    top: 0;
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-top: 10px;

  h3 {
    ${({ theme }) => theme.fonts.Title3};
  }

  p {
    ${({ theme }) => theme.fonts.Title5};
    color: ${({ theme }) => theme.colors.Gray0};
  }
`;

const Synopsis = styled.div`
  line-height: 1.6;
  margin-bottom: 2rem;

  ${({ theme }) => theme.fonts.Body4};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.7rem;

  margin-bottom: 1rem;

  img {
    width: 20px;
    height: 20px;
  }

  p {
    ${({ theme }) => theme.fonts.Title5};
  }
`;

const CastGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 0.5rem;

  width: 100%;
  overflow-x: auto;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const CastMember = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  flex: 0 0 104px;
  height: auto;

  img {
    width: 100%;
  }

  p {
    margin-top: 5px;
    ${({ theme }) => theme.fonts.Body2};
  }
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  margin-left: auto;
  margin-right: auto;
  margin-top: 3rem;

  border-radius: 20px;
  padding: 1rem 2rem;

  text-align: center;

  background-image: linear-gradient(to right, #0062ff, #71c8ff);
  ${({ theme }) => theme.fonts.Head2};
  color: ${({ theme }) => theme.colors.White};

  p {
    margin-left: 1.5rem;
  }
`;
