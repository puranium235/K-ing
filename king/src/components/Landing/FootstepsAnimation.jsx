import { motion } from 'framer-motion';
import React from 'react';
import styled from 'styled-components';

import { IcFootprintLeft, IcFootprintRight } from '../../assets/icons';

// 색상 배열
const footprintColors = [
  '#E8E8F4',
  '#E8E8F4',
  '#E8E8F4',
  '#CFCED3',
  '#CFCED3',
  '#CFCED3',
  '#CFCED3',
  '#3D3D3D',
  '#3D3D3D',
];

// Styled SVG Components
const StyledFootprintLeft = styled(IcFootprintLeft)`
  color: ${({ index }) => footprintColors[index] || '#191919'};
  width: 24px;
  height: auto;
`;

const StyledFootprintRight = styled(IcFootprintRight)`
  color: ${({ index }) => footprintColors[index] || '#191919'};
  width: 26px;
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
    { x: -165, y: -130, rotate: 90, delay: 0 },
    { x: -150, y: -100, rotate: 60, delay: 0.3 },
    { x: -105, y: -140, rotate: 70, delay: 0.6 },
    { x: -85, y: -110, rotate: 40, delay: 0.9 },
    { x: -35, y: -160, rotate: 30, delay: 1.2 },
    { x: 5, y: -140, rotate: 15, delay: 1.5 },
    { x: 25, y: -220, rotate: 10, delay: 1.8 },
    { x: 70, y: -215, rotate: -10, delay: 2.1 },
    { x: 85, y: -300, rotate: 5, delay: 2.4 },
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
  left: 20%;
  width: 300px;
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
`;
