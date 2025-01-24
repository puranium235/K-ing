import React, { useState } from 'react';
import styled from 'styled-components';

import ShareIcon from '/src/assets/icons/send-outline.png';
import ShareModal from '/src/components/common/ShareModal';

import { IcBookmark } from '../../assets/icons';

const FunctionButton = ({ bookmarked }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <ButtonContainer>
      <ShareButton onClick={openModal}>
        <img src={ShareIcon} alt="Share" />
      </ShareButton>

      {/* 공유 모달 */}
      <ShareModal isModalVisible={isModalVisible} onClick={closeModal} />

      {bookmarked && <IcBookmark />}
    </ButtonContainer>
  );
};

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  padding: 0px 10px;
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
  width: 30px;
  height: 30px;
  white-space: nowrap;
  padding: 7px;
  border: none;
  border-radius: 10px;
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
