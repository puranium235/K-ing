import React from 'react';
import styled from 'styled-components';

import { IcFootsteps, IcKing } from '../../assets/icons';
import GoogleIcon from '../../assets/icons/ic_google.png';
import LineIcon from '../../assets/icons/ic_line_88.png';
const Landing = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const googleLogin = () => {
    window.location.href = API_BASE_URL + '/oauth2/authorization/google';
  };

  return (
    <St.Page>
      <St.ContentWrapper>
        <St.IconWrapper>
          <IcKing />
        </St.IconWrapper>
        <St.TaglineWrapper>
          <St.Tagline>드라마의 발자취를 따라 주인공이 되어보세요.</St.Tagline>
          <St.Title>촬영 배경지 큐레이션 서비스</St.Title>
        </St.TaglineWrapper>
        <St.BrandName>K-ing</St.BrandName>
      </St.ContentWrapper>
      <St.FootprintWrapper>
        <IcFootsteps />
      </St.FootprintWrapper>
      <St.ButtonWrapper>
        <St.SocialButton $google onClick={googleLogin}>
          <img src={GoogleIcon} alt="구글 아이콘" />
          Continue with Google
        </St.SocialButton>
        <St.SocialButton $line>
          <img src={LineIcon} alt="라인 아이콘" />
          Continue with LINE
        </St.SocialButton>
      </St.ButtonWrapper>
    </St.Page>
  );
};

export default Landing;

const St = {
  Page: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap: 5rem;
    position: relative;
    height: 100vh;
    background-color: ${({ theme }) => theme.colors.White || '#fff'};
  `,
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
  Tagline: styled.p`
    ${({ theme }) => theme.fonts.Body4 || 'font-size: 1rem;'}
    color: ${({ theme }) => theme.colors.Gray2 || '#666'};
    text-align: center;
  `,
  Title: styled.h1`
    ${({ theme }) => theme.fonts.Title2 || 'font-size: 1.5rem;'}
    font-weight: bold;
    text-align: center;
  `,
  BrandName: styled.h2`
    ${({ theme }) => 'font-size: 3rem;'}
    font-weight: bold;
    margin-top: 10px;
    color: ${({ theme }) => theme.colors.Gray0};
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
  SocialButton: styled.button`
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
  `,
};
