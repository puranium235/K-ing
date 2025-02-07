import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import styled from 'styled-components';

import { getPostDraft } from '../../../lib/post';
import { DraftExist } from '../../../recoil/atom';

const UploadModal = ({ isShowing }) => {
  const navigate = useNavigate();
  const options = ['인증샷 업로드', '큐레이션 발행'];

  // 게시글 임시저장
  const setDraftExist = useSetRecoilState(DraftExist);

  const checkDraft = async () => {
    const res = await getPostDraft();
    if (res) {
      setDraftExist(true);
    } else {
      setDraftExist(false);
    }
  };

  const onOptionClick = (option) => {
    if (option === '인증샷 업로드') {
      checkDraft();
      navigate(`/upload/post`);
    } else {
      navigate(`/upload/curation`);
    }
  };

  return (
    isShowing && (
      <ModalContainer $isShowing={isShowing}>
        {options.map((option) => (
          <OptionButton key={option} onClick={() => onOptionClick(option)}>
            {option}
          </OptionButton>
        ))}
      </ModalContainer>
    )
  );
};

export default UploadModal;

const ModalContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
  background-color: #f8f8f8;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding: 3rem;
  box-shadow: 0px -2px 15px rgba(0, 0, 0, 0.1);
  z-index: 1010;
  display: ${({ $isShowing }) => ($isShowing ? 'block' : 'none')};
  animation: ${({ $isShowing }) =>
    $isShowing ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-out'};

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(100%);
    }
  }
`;

const OptionButton = styled.div`
  ${({ theme }) => theme.fonts.Body1};
  color: ${({ theme }) => theme.colors.MainBlue};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.6rem;
  background-color: white;
  border-radius: 16px;
  margin-bottom: 0.6rem;
  cursor: pointer;

  &:hover {
    background-color: rgb(238, 238, 238);
  }

  img {
    width: 1.2rem;
    height: 1.2rem;
  }
`;
