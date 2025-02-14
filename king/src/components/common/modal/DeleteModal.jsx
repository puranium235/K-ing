import React from 'react';
import styled from 'styled-components';

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null; // 모달이 열려 있지 않으면 렌더링 안 함

  return (
    <ModalOverlay>
      <ModalContent>
        <p>정말 삭제하시겠습니까?</p>
        <ButtonGroup>
          <button onClick={onConfirm}>확인</button>
          <button onClick={onClose}>취소</button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DeleteModal;

// ✅ 모달 스타일
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;

  p {
    ${({ theme }) => theme.fonts.Body2};
    color: ${({ theme }) => theme.colors.Gray0};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 1rem;

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 10px;
    ${({ theme }) => theme.fonts.Body3};
    color: ${({ theme }) => theme.colors.Gray0};
    cursor: pointer;
  }

  button:first-child {
    background: ${({ theme }) => theme.colors.Red};
    color: white;
  }

  button:last-child {
    background: ${({ theme }) => theme.colors.Gray1};
    color: white;
  }
`;
