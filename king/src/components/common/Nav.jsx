import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import {
  IcArchive,
  IcArchiveSelected,
  IcChatbot,
  IcChatbotSelected,
  IcHome,
  IcHomeSelected,
  IcMypage,
  IcMypageSelected,
  IcUpload,
  IcUploadSelected,
} from '../../assets/icons';

const Nav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedButton, setSelectedButton] = useState(location.pathname);

  const handleButtonClick = buttonName => {
    setSelectedButton(buttonName);
    navigate(`/${buttonName}`);
  };

  return (
    <StNavWrapper>
      <button
        className={selectedButton === '/home' ? 'selected' : ''}
        type="button"
        onClick={() => handleButtonClick('home')}
      >
        {selectedButton === '/home' ? <IcHomeSelected /> : <IcHome />}

        <p>Home</p>
      </button>

      <button
        // className={selectedButton === '/chatbot' ? 'selected' : ''}
        type="button"
        onClick={() => handleButtonClick('chatbot')}
      >
        {selectedButton === '/chatbot' ? <IcChatbotSelected /> : <IcChatbot />}

        <p>K-ing</p>
      </button>
      <button
        className={selectedButton === '/upload' ? 'selected' : ''}
        type="button"
        onClick={() => handleButtonClick('upload')}
      >
        {selectedButton === '/upload' ? <IcUploadSelected /> : <IcUpload />}

        <p>Upload</p>
      </button>
      <button
        className={selectedButton === '/archive' ? 'selected' : ''}
        type="button"
        onClick={() => handleButtonClick('archive')}
      >
        {selectedButton === '/archive' ? <IcArchiveSelected /> : <IcArchive />}

        <p>Archive</p>
      </button>
      <button
        className={selectedButton === '/mypage' ? 'selected' : ''}
        type="button"
        onClick={() => handleButtonClick('mypage')}
      >
        {selectedButton === '/mypage' ? <IcMypageSelected /> : <IcMypage />}

        <p>MyPage</p>
      </button>
    </StNavWrapper>
  );
};

export default Nav;

const StNavWrapper = styled.nav`
  display: flex;
  justify-content: space-around;

  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);

  width: 321px;
  height: 68px;
  padding: 0 1rem;

  border-radius: 30px;

  background-color: ${({ theme }) => theme.colors.Gray1};
  & > button {
    color: ${({ theme }) => theme.colors.White};
    ${({ theme }) => theme.fonts.Body4}
  }
`;
