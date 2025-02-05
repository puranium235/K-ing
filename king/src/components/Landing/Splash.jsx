import React from 'react';
import styled, { keyframes } from 'styled-components';

import { IcFootsteps, IcKing } from '../../assets/icons';
import KingLogo from '../../assets/icons/king_logo.png';
import KingLogoImsi from '../../assets/icons/king_logo_imsi.png';
import FootstepsAnimation from './FootstepsAnimation';

const Splash = () => {
  return (
    <StSplashWrapper>
      <LogoImage src={KingLogo} alt="King Logo" />

      <FootstepsAnimation />
    </StSplashWrapper>
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

const StSplashWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.White};
  animation: ${fadeIn} 1s ease-in-out;
`;

const LogoImage = styled.img`
  width: 15rem;
  height: auto;
  margin-top: -10rem;
  position: relative; /* 요소를 독립적으로 배치하기 위해 */
  z-index: 2; /* 발자국보다 앞에 배치 */
`;
