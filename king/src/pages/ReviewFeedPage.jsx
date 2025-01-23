import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';

import BackIcon from '../assets/icons/icon-back.png';
import SortingIcon from '../assets/icons/icon-sorting.png';
import Nav from '../components/common/Nav';
import SortingModal from '../components/common/SortingModal';

const ReviewFeedPage = () => {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleClose = () => {
    navigate(-1, { state: { placeId } });
  };

  const openModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };
  return (
    <>
      <Header>
        <BackButton onClick={handleClose}>
          <img src={BackIcon} alt="Back" />
        </BackButton>
        <Title>Title</Title>
      </Header>
      <SortingContainer>
        <SortingButton onClick={openModal}>
          <img src={SortingIcon} alt="Sorting" />
          <SortingTitle>인기순</SortingTitle>
        </SortingButton>
      </SortingContainer>
      <SortingModal isModalVisible={isModalVisible} onClick={closeModal} />
      <Title>여기에 장소ID {placeId} 에 해당하는 인증샷 게시글이 다 보여야 함</Title>
      <Nav />
    </>
  );
};

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 14px 10px;
  gap: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.Gray5};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;

  img {
    width: 8px;
  }
`;

const SortingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: right;
  padding: 20px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.Gray5};
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

const Title = styled.h1`
  ${({ theme }) => theme.fonts.Title3};
  margin: 0;
`;

export default ReviewFeedPage;
