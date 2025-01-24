import React, { useState } from 'react';
import styled from 'styled-components';

import SortingIcon from '../../assets/icons/icon-sorting.png';
import SortingModal from '../../components/common/SortingModal';

const SortingRow = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };
  return (
    <>
      <SortingContainer>
        <SortingButton onClick={openModal}>
          <img src={SortingIcon} alt="Sorting" />
          <SortingTitle>인기순</SortingTitle>
        </SortingButton>
      </SortingContainer>
      <SortingModal isModalVisible={isModalVisible} onClick={closeModal} />
    </>
  );
};

const SortingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  padding: 10px;
`;

const SortingButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;

  img {
    width: 16px;
  }
`;

const SortingTitle = styled.div`
  ${({ theme }) => theme.fonts.Title6};
  color: ${({ theme }) => theme.colors.MainBlue};
`;

export default SortingRow;
