import React from "react";
import styled from "styled-components";

import { IcStar } from "../../assets/icons";

const DramaDetails = () => {
  return (
    <DramaPageContainer>
      <h3>{"<"} 세부정보</h3>
      <Header>
        <img src="/src/assets/dummy/poster1.png" alt="Drama Poster" />
        <TitleSection>
          <h3>도깨비</h3>
          <p>드라마</p>
          <p>tvN</p>
        </TitleSection>
        <IcStar />
      </Header>

      <h3>소개</h3>
      <Synopsis>
        불멸의 삶을 끝내기 위해 인간 신부가 필요한 도깨비, 그와 기묘한 동거를
        시작한 기억상실증 저승사자. 그런 그들 앞에 '도깨비 신부' 라 주장하는
        '죽었어야 할 운명'의 소녀가 나타나며 벌어지는 신비로운 낭만 설화
      </Synopsis>

      <h3>등장인물</h3>
      <CastGrid>
        <CastMember>
          <CastPhoto src="/src/assets/dummy/celeb1.png" alt="Cast Member" />
          <CastName>공유</CastName>
        </CastMember>
        <CastMember>
          <CastPhoto src="/src/assets/dummy/celeb2.png" alt="Cast Member" />
          <CastName>김고은</CastName>
        </CastMember>
        <CastMember>
          <CastPhoto src="/src/assets/dummy/celeb3.png" alt="Cast Member" />
          <CastName>이동욱</CastName>
        </CastMember>
        <CastMember>
          <CastPhoto src="/src/assets/dummy/celeb4.png" alt="Cast Member" />
          <CastName>유인나</CastName>
        </CastMember>
      </CastGrid>
      <ActionButton>촬영지 알아보기</ActionButton>
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
  display: flex;
  flex-direction: row;
  align-items: end;
  margin-bottom: 20px;

  img {
    width: 60%;
    margin-right: 2rem;
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  margin-top: 10px;

  h3 {
    font-size: 24px;
    margin: 10px 0;
  }

  p {
    font-size: 16px;
    color: #666;
  }
`;

const Synopsis = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #333;
`;

const CastGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-top: 20px;
`;

const CastMember = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CastPhoto = styled.img`
  width: 100%;
`;

const CastName = styled.span`
  margin-top: 5px;
  font-size: 14px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  width: 80%;
  margin-top: 30px;
  margin-left: auto;
  margin-right: auto;

  border-radius: 20px;

  text-align: center;
  ${({ theme }) => theme.fonts.Title3};
  background-image: linear-gradient(to right, #0062ff, #71c8ff);
  color: white;
`;
