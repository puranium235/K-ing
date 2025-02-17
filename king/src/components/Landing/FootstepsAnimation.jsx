import { motion } from 'framer-motion';
import React from 'react';
import styled from 'styled-components';

import { IcFootL, IcFootR } from '../../assets/icons';

// 색상 배열
const footprintColors = ['#E8E8F4', '#CFCED3', '#CFCED3', '#3D3D3D', '#3D3D3D'];

// Styled SVG Components
const StyledFootprintLeft = styled(IcFootL)`
  color: ${({ index }) => footprintColors[index] || '#191919'};
  width: 3rem;
  height: auto;
`;

const StyledFootprintRight = styled(IcFootR)`
  color: ${({ index }) => footprintColors[index] || '#191919'};
  width: 3rem;
  height: auto;
`;

// 개별 발자국 컴포넌트
const Footprint = ({ delay, x, y, rotate, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5, x: x - 10, y: y - 10, rotate: rotate - 10 }}
    animate={{ opacity: 1, scale: 1, x, y, rotate }}
    transition={{
      duration: 0.3,
      delay,
      ease: 'easeOut',
    }}
  >
    {index % 2 === 0 ? (
      <StyledFootprintLeft index={index} />
    ) : (
      <StyledFootprintRight index={index} />
    )}
  </motion.div>
);

const FootstepsAnimation = () => {
  const footprints = [
    { x: -100, y: -200, rotate: 60, delay: 0 },
    { x: -30, y: -220, rotate: 60, delay: 0.3 },
    { x: -20, y: -320, rotate: 60, delay: 0.6 },
    { x: 50, y: -340, rotate: 60, delay: 0.9 },
    { x: 60, y: -440, rotate: 60, delay: 1.2 },
  ];

  return (
    <FootstepsWrapper>
      {footprints.map((step, index) => (
        <Footprint
          key={index}
          index={index}
          x={step.x}
          y={step.y}
          rotate={step.rotate}
          delay={step.delay}
        />
      ))}
    </FootstepsWrapper>
  );
};

export default FootstepsAnimation;

// 스타일 정의
const FootstepsWrapper = styled.div`
  position: absolute;
  bottom: 10%;
  width: 20rem;
  /* height: 35rem; */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
`;
