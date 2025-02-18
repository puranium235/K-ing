import CopyToClipboard from 'react-copy-to-clipboard';
import styled, { keyframes } from 'styled-components';

import kingCharacter from '/src/assets/icons/king_character.png';

import SmallModal from '../../common/modal/smallModal';
import CancelButton from '../button/CancelButton';
import ConfirmButton from '../button/ConfirmButton';

const CopyLinkModal = ({ curationId, isShowing, closeModal }) => {
  return (
    isShowing && (
      <SmallModal title="링크 공유하기" isShowing={isShowing}>
        <StLinkShareWrapper>
          <AnimatedCharacter src={kingCharacter} alt="Uploading Character" />
          <StCopyLink>
            <p>{`https://i12a507.p.ssafy.io/curation/${curationId}`}</p>
          </StCopyLink>
          <ButtonWrapper>
            <CopyToClipboard
              text={`https://i12a507.p.ssafy.io/curation/${curationId}`}
              onCopy={() => alert('링크가 복사되었습니다')}
            >
              <ConfirmButton btnName="복사" onClick={closeModal} />
            </CopyToClipboard>
            <CancelButton btnName="닫기" onClick={closeModal} />
          </ButtonWrapper>
        </StLinkShareWrapper>
      </SmallModal>
    )
  );
};

export default CopyLinkModal;

const StLinkShareWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1rem 2rem;

  & > button {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 80%;

    padding: 0.6rem;
    border: 0rem;
    background-color: ${({ theme }) => theme.colors.MainBlue};
    ${({ theme }) => theme.fonts.Body3};
    color: ${({ theme }) => theme.colors.White};
    border-radius: 0.5rem;
  }
`;

const AnimatedCharacter = styled.img`
  width: 100px;
  height: 100px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 1rem;
`;

const StCopyLink = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: fit-content;
  position: relative;

  padding: 0.6rem 1.2rem;
  border-radius: 1rem;

  ${({ theme }) => theme.fonts.Body3};
  text-align: center;
  line-height: 1.5;

  & > p {
    padding: 0.5rem 1rem;

    border: 0.1rem solid lightgray;
    border-color: ${({ theme }) => theme.colors.MainBlue};
    border-radius: 0.5rem;

    color: ${({ theme }) => theme.colors.Gray1};
    ${({ theme }) => theme.fonts.Body3};
  }
`;
