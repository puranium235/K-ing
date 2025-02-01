import React from 'react';
import styled from 'styled-components';

const SignupCompletePage = () => {
  const handleLogin = () => {
    window.location.href = '/home';
  };

  return (
    <St.Page>
      <St.ContentWrapper>
        <Title>회원가입 완료</Title>
        <Message>회원가입이 완료되었습니다.</Message>
      </St.ContentWrapper>
      <St.ButtonWrapper>
        <ButtonContainer>
          <Button $primary onClick={handleLogin}>
            홈으로 가기
          </Button>
        </ButtonContainer>
      </St.ButtonWrapper>
    </St.Page>
  );
};

export default SignupCompletePage;

const St = {
  Page: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 5rem;
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

const Message = styled.p`
  ${({ theme }) => theme.fonts.Title3}
  text-align: center;
  color: ${({ theme }) => theme.colors.Gray0};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
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
`;
