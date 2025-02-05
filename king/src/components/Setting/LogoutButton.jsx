import React from 'react';
import styled from 'styled-components';

const LogoutButton = () => {
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.location.replace('/');
  };

  return <StLogoutButton onClick={handleLogout}>로그아웃</StLogoutButton>;
};

export default LogoutButton;

const StLogoutButton = styled.button`
  padding: 1.5rem 2.45rem;
  color: ${({ theme }) => theme.colors.Red};
  text-align: left;
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  ${({ theme }) => theme.fonts.Body2}
  /* font-size: 1.6rem; */

  &:hover {
    background-color: ${({ theme }) => theme.colors.Gray1};
  }
`;
