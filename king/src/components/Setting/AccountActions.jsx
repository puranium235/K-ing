import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { deleteAccount, logout } from '../../lib/auth';

const AccountActions = () => {
  const navigate = useNavigate();

  // 🔹 로그아웃 처리
  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      localStorage.removeItem('accessToken');
      window.location.replace('/');
    } else {
      alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 🔹 회원 탈퇴 처리
  const handleDeleteAccount = async () => {
    navigate('/setting/delete-account');
  };

  return (
    <StActionsWrapper>
      <StLogoutButton onClick={handleLogout}>로그아웃</StLogoutButton>
      <StDeleteAccountButton onClick={handleDeleteAccount}>회원 탈퇴</StDeleteAccountButton>
    </StActionsWrapper>
  );
};

export default AccountActions;

const StActionsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 3.5rem;
  margin-top: auto; /* ✅ 하단에 고정 */
`;

const StLogoutButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.Gray2};
  cursor: pointer;
  ${({ theme }) => theme.fonts.Body2}

  &:hover {
    color: ${({ theme }) => theme.colors.Gray0};
  }
`;

const StDeleteAccountButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.Gray2};
  cursor: pointer;
  ${({ theme }) => theme.fonts.Body2}

  &:hover {
    color: ${({ theme }) => theme.colors.Red};
  }
`;
