import React from 'react';
import styled from 'styled-components';

const ChatbotPage = () => {
  return <>챗봇페이지</>;
};

export default ChatbotPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
