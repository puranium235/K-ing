import { useSetRecoilState } from 'recoil';
import { styled } from 'styled-components';

import { IcKing } from '../../assets/icons';
import { DraftExist } from '../../recoil/atom';
import CancelButton from './button/CancelButton';
import ConfirmButton from './button/ConfirmButton';

const DraftModal = ({ isShowing, handleCancel }) => {
  const setDraft = useSetRecoilState(DraftExist);

  const handleConfirmDraft = async () => {
    setDraft(true);
    handleCancel();
  };

  return (
    isShowing && (
      <SmallModal title="임시저장 불러오기" isShowing={isShowing}>
        <StDraftModalWrapper>
          <StCommentWrapper>
            <IcKing />
            <p>임시저장된 컨텐츠를 불러오시겠습니까?</p>
          </StCommentWrapper>
          <StBtnWrapper>
            <CancelButton btnName="취소" onClick={handleConfirmDraft} />
            <ConfirmButton
              btnName="확인"
              onClick={() => {
                handleCancel();
              }}
            />
          </StBtnWrapper>
        </StDraftModalWrapper>
      </SmallModal>
    )
  );
};

export default DraftModal;

const StDraftModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  padding: 1.5rem 2rem;
`;

const StCommentWrapper = styled.div`
  display: flex;
  justify-content: center;

  width: 100%;
  margin: 1rem;

  & > p {
    margin-top: 5rem;
    margin-left: 2rem;

    color: ${({ theme }) => theme.colors.MainbBlue};
    ${({ theme }) => theme.fonts.Body2};
  }
`;
const StBtnWrapper = styled.div`
  display: flex;
  gap: 1rem;
`;
