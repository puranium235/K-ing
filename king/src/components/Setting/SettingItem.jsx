import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcNavigateNext } from '../../assets/icons';

const SettingItem = ({ title, path }) => {
  const navigate = useNavigate();

  return (
    <StItemWrapper onClick={() => navigate(path)}>
      <St.Title>{title}</St.Title>
      <IcNavigateNext />
    </StItemWrapper>
  );
};

export default SettingItem;

const StItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.Gray2};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.Gray1};
  }
`;

const St = {
  Title: styled.div`
    padding-left: 1rem;
    ${({ theme }) => theme.fonts.Body2}
  `,
};
