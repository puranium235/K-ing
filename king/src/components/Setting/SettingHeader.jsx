import React from 'react';
import styled from 'styled-components';

import BackButton from '../common/button/BackButton';

const SettingHeader = ({ title }) => {
  return (
    <StHeaderWrapper>
      <BackButton />
      <St.Header>{title}</St.Header>
    </StHeaderWrapper>
  );
};

export default SettingHeader;

const StHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 1.5rem;
  border-bottom: 0.1rem solid ${({ theme }) => theme.colors.Gray2};
`;

const St = {
  Header: styled.header`
    position: sticky;
    top: 0;
    background-color: ${({ theme }) => theme.colors.White};
    z-index: 10;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
  `,
};
