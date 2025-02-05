import React from 'react';
import styled from 'styled-components';

import { logout } from '../../lib/auth';

const LogoutButton = () => {
  const handleLogout = async () => {
    const success = await logout();

    if (success) {
      localStorage.removeItem('accessToken'); // ✅ 토큰 삭제
      window.location.replace('/'); // ✅ 로그인 페이지로 이동
    } else {
      console.log(success);
      alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
    }
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
