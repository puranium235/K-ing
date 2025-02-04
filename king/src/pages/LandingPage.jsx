import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Landing from '../components/Landing/Landing';
import Splash from '../components/Landing/Splash';

const LandingPage = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // 3초 후 Splash -> Landing으로 변경
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Wrapper>
      <AnimatePresence>
        {showSplash ? (
          <MotionSplash
            key="splash"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Splash />
          </MotionSplash>
        ) : (
          <MotionLanding
            key="landing"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <Landing />
          </MotionLanding>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};

export default LandingPage;

// 🔹 `motion.div`을 적용하여 애니메이션 추가
const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const MotionSplash = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const MotionLanding = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
`;
