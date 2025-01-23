import React, { useState } from 'react';
import styled from 'styled-components';

import RouteIcon from '/src/assets/icons/route.png';
import ShareIcon from '/src/assets/icons/send-outline.png';

import DeepLinkModal from '../common/DeepLinkModal';

const FunctionButton = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <ButtonContainer>
      <DirectionButton onClick={openModal}>
        <img src={RouteIcon} alt="FindRoute" />
        길찾기
      </DirectionButton>

      {/* 모달 */}
      <DeepLinkModal isModalVisible={isModalVisible} onClick={closeModal} />

      <ShareButton>
        <img src={ShareIcon} alt="Share" />
        공유
      </ShareButton>
    </ButtonContainer>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px 0px;
  gap: 10px;
`;

const DirectionButton = styled.button`
  ${({ theme }) => theme.fonts.Body2};
  background-color: ${({ theme }) => theme.colors.Gray0};
  color: white;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 70px;
  height: 34px;
  white-space: nowrap;
  padding: 12px;
  border: none;
  border-radius: 16px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.Gray1};
  }

  img {
    width: 14px;
    height: 14px;
  }
`;

const ShareButton = styled.button`
  ${({ theme }) => theme.fonts.Body2};
  background-color: ${({ theme }) => theme.colors.Gray5};
  color: ${({ theme }) => theme.colors.Gray0};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 70px;
  height: 34px;
  white-space: nowrap;
  padding: 12px;
  border: none;
  border-radius: 16px;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.Gray3};
  }

  img {
    width: 14px;
    height: 14px;
  }
`;

export default FunctionButton;
