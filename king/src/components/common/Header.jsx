import React, { useState } from 'react';
import styled from 'styled-components';

import OptionIcon from '/src/assets/icons/option.png';
import BackButton from '/src/components/common/BackButton';
import OptionModal from '/src/components/common/OptionModal';

const Header = ({ title, isOption }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <StHeader>
        <BackButton />
        <Title>{title}</Title>
        {isOption && (
          <OptionButton onClick={openModal}>
            <img src={OptionIcon} alt="Option" />
          </OptionButton>
        )}
      </StHeader>

      {/* 옵션 모달 */}
      <OptionModal isModalVisible={isModalVisible} onClick={closeModal} />
    </>
  );
};

const StHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 10px;
  gap: 10px;
`;

const OptionButton = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;

  img {
    height: 18px;
  }
`;

const Title = styled.h1`
  ${({ theme }) => theme.fonts.Title3};
`;

export default Header;
