import React from 'react';
import styled from 'styled-components';

import { IcFootsteps, IcKing } from '../../assets/icons';
import GoogleIcon from '../../assets/icons/ic_google.png';
import LineIcon from '../../assets/icons/ic_line_88.png';
import KingLogo from '../../assets/icons/king_logo.png';
import KingLogoImsi from '../../assets/icons/king_logo_imsi.png';
const Landing = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const googleLogin = () => {
    window.location.href = API_BASE_URL + '/oauth2/authorization/google';
  };

  return (
    <StLandingWrapper>
      <St.ContentWrapper>
        {/* <St.IconWrapper>
          <IcKing />
          </St.IconWrapper> */}
        <St.TaglineWrapper>
          <Tagline>드라마의 발자취를 따라 주인공이 되어보세요.</Tagline>
          <Title>촬영 배경지 큐레이션 서비스</Title>
        </St.TaglineWrapper>
        {/* <BrandName>K-ing</BrandName> */}
        <LogoImage src={KingLogo} alt="King Logo" />
      </St.ContentWrapper>
      {/* <St.FootprintWrapper>
        <IcFootsteps />
      </St.FootprintWrapper> */}
      <St.ButtonWrapper>
        <SocialButton $google onClick={googleLogin}>
          <img src={GoogleIcon} alt="구글 아이콘" />
          Continue with Google
        </SocialButton>
        <SocialButton $line>
          <img src={LineIcon} alt="라인 아이콘" />
          Continue with LINE
        </SocialButton>
      </St.ButtonWrapper>
    </StLandingWrapper>
  );
};

export default Landing;

const StLandingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 5rem;
  position: relative;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.White};
`;

const St = {
  ContentWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px; /* 아이콘과 텍스트 사이 간격 */
    margin-top: 15%; /* 화면의 중앙에 가까운 위치 */
  `,
  IconWrapper: styled.div`
    font-size: 4rem;
  `,
  TaglineWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px; /* 줄 간격 */
  `,
  FootprintWrapper: styled.div`
    /* margin-top: 10px;
    margin-bottom: 20px; */
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  ButtonWrapper: styled.div`
    /* position: absolute;
    top: 80%; */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
    max-width: 300px; /* 버튼의 최대 너비 제한 */
  `,
};

const Tagline = styled.p`
  ${({ theme }) => theme.fonts.Body4}
  color: ${({ theme }) => theme.colors.Gray2};
  text-align: center;
`;
const Title = styled.h1`
  ${({ theme }) => theme.fonts.Title2}
  font-weight: bold;
  text-align: center;
`;
const BrandName = styled.h2`
  ${({ theme }) => 'font-size: 3rem;'}
  font-weight: bold;
  margin-top: 10px;
  color: ${({ theme }) => theme.colors.Gray0};
`;
const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 왼쪽 정렬 */
  gap: 10px;
  padding: 15px 20px; /* 왼쪽 여백 추가 */
  width: 100%;
  max-width: 300px;
  border: none;
  border-radius: 5px;
  font-size: ${({ theme }) => theme.fonts.Body3};
  cursor: pointer;

  background-color: ${({ $google }) => ($google ? '#4285F4' : '#00C300')};
  color: white;

  img {
    width: 20px;
    height: 20px;
  }

  &:hover {
    opacity: 0.9;
  }
`;

const LogoImage = styled.img`
  width: 200px;
  height: auto;
  position: relative; /* 요소를 독립적으로 배치하기 위해 */
  z-index: 2; /* 발자국보다 앞에 배치 */
`;
