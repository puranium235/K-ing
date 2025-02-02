import React from 'react';
import styled, { keyframes } from 'styled-components';

import { IcFootsteps, IcKing } from '../../assets/icons';
import KingLogo from '../../assets/icons/king_logo.png';
import KingLogoImsi from '../../assets/icons/king_logo_imsi.png';
import FootstepsAnimation from './FootstepsAnimation';

const Splash = () => {
  return (
    <SplashWrapper>
      {/* <IconWrapper>
        <IcKing />
      </IconWrapper>
      <BrandName>K-ing</BrandName> */}
      <LogoImage src={KingLogo} alt="King Logo" />

      {/* <img src={KingLogoImsi} alt="King Logo" width={300} height={300} /> */}

      <FootstepsAnimation />
      {/* <FootprintWrapper>
        <IcFootsteps />
      </FootprintWrapper> */}
    </SplashWrapper>
  );
};

export default Splash;

// 애니메이션 효과 추가
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LogoImage = styled.img`
  width: 150px;
  height: auto;
  margin-top: -100px;
  position: relative; /* 요소를 독립적으로 배치하기 위해 */
  z-index: 2; /* 발자국보다 앞에 배치 */
`;

const SplashWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.White};
  animation: ${fadeIn} 1s ease-in-out;
`;

const IconWrapper = styled.div`
  font-size: 4rem;
`;

const BrandName = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-top: 10px;
`;

const FootprintWrapper = styled.div`
  margin-top: 20px;
`;
