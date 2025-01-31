import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcKing } from '../../assets/icons';
import { checkNickname, postSignup } from '../../lib/auth';

const Signup = () => {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('ko'); // 기본값을 한국어('ko')로 설정
  const [isValidName, setIsValidName] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState(false);
  const [checkingName, setCheckingName] = useState(false); // 중복 검사 진행 중 여부
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // 닉네임 유효성 검사
  useEffect(() => {
    const trimmedName = name.trim();

    if (name.length === 0) {
      setIsValidName(false);
      setErrorMessage('닉네임은 50자 이내여야 합니다.');
    } else if (trimmedName.length === 0) {
      setIsValidName(false);
      setErrorMessage('닉네임은 공백만 입력할 수 없습니다.');
    } else if (trimmedName.length > 50) {
      setIsValidName(false);
      setErrorMessage('닉네임은 50자 이내여야 합니다.');
    } else {
      setIsValidName(true);
      setErrorMessage('');
    }
  }, [name]);

  // ✅ 닉네임 중복 검사 API 호출
  useEffect(() => {
    if (!isValidName) return;

    const timer = setTimeout(async () => {
      setCheckingName(true);
      const { success, message } = await checkNickname(name);

      setIsNameAvailable(success); // 성공 여부 업데이트
      if (!success) {
        setErrorMessage(message); // 중복된 경우 에러 메시지 설정
      }

      setCheckingName(false);
    }, 500); // 500ms 디바운싱 적용

    return () => clearTimeout(timer);
  }, [name, isValidName]);

  // ✅ 회원가입 API 호출
  const handleSignup = async () => {
    setErrorMessage('');

    const { success, message } = await postSignup(name, language);
    if (success) {
      navigate('/signup/complete');
    } else {
      setErrorMessage(message);
    }
  };

  return (
    <St.Page>
      <St.ContentWrapper>
        <Title>사용자 정보 입력</Title>
        <St.IconWrapper>
          <IcKing />
        </St.IconWrapper>
        <Label>닉네임</Label>
        <Input
          type="text"
          placeholder="닉네임을 입력하세요."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <StatusMessageWrapper>
          {/* 닉네임 유효성 및 중복 검사 메시지 */}
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          {checkingName && <InfoMessage>닉네임 중복 검사 중...</InfoMessage>}
          {isValidName && isNameAvailable && (
            <SuccessMessage>사용 가능한 닉네임입니다!</SuccessMessage>
          )}
        </StatusMessageWrapper>

        <Label>언어</Label>
        <SelectWrapper>
          <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="ko">한국어</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
            <option value="zh">中文</option>
          </Select>
        </SelectWrapper>
      </St.ContentWrapper>
      <St.ButtonWrapper>
        <ButtonContainer>
          <Button>돌아가기</Button>
          <Button $primary disabled={!isValidName || !isNameAvailable} onClick={handleSignup}>
            회원가입 완료하기
          </Button>
        </ButtonContainer>
      </St.ButtonWrapper>
    </St.Page>
  );
};

export default Signup;

const St = {
  Page: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    gap: 5rem;
    position: relative;
    height: 100vh;
    background-color: ${({ theme }) => theme.colors.White};
  `,
  ContentWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 350px;
    padding: 0 20px;
    gap: 20px;
  `,
  IconWrapper: styled.div`
    ${({ theme }) => theme.fonts.Title2}
  `,
  ButtonWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
    max-width: 350px;
  `,
};

const Title = styled.h1`
  ${({ theme }) => theme.fonts.Title1}
  font-weight: bold;
  margin-bottom: 10px;
`;

const Label = styled.label`
  align-self: flex-start;
  ${({ theme }) => theme.fonts.Title3}
  font-weight: 600;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.colors.White};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const SelectWrapper = styled.div`
  width: 100%;
  position: relative;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px; /* Input과 동일하게 맞춤 */
  border: 1px solid ${({ theme }) => theme?.colors?.Gray2};
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 500;
  background-color: ${({ theme }) => theme.colors.White};
  color: ${({ theme }) => theme.colors.Gray0};
  appearance: none;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.MainBlue};
    outline: none;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  margin-top: 5px;
`;

const InfoMessage = styled.p`
  color: #666;
  font-size: 14px;
  margin-top: 5px;
`;

const SuccessMessage = styled.p`
  color: green;
  font-size: 14px;
  margin-top: 5px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px;
  ${({ theme }) => theme.fonts.Title4}
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;

  background-color: ${({ $primary, theme }) =>
    $primary ? theme.colors.MainBlue : theme.colors.Gray2};
  color: ${({ $primary, theme }) => ($primary ? theme.colors.White : theme.colors.Gray0)};

  &:hover {
    opacity: 0.8;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.Gray2};
    cursor: not-allowed;
  }
`;
const StatusMessageWrapper = styled.div`
  height: 20px; /* ✅ 고정 높이 지정 */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;
