import React from 'react';
import styled from 'styled-components';

import LogoutButton from './LogoutButton';
import SettingHeader from './SettingHeader';
import SettingList from './SettingList';

const Setting = () => {
  return (
    <StSettingPageWrapper>
      <SettingHeader title="설정" />
      <SettingList />
      <LogoutButton />
    </StSettingPageWrapper>
  );
};

export default Setting;

const StSettingPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.White};
`;
