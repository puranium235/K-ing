import React from 'react';
import styled from 'styled-components';

import AccountActions from './AccountActions';
import SettingHeader from './SettingHeader';
import SettingList from './SettingList';

const Setting = () => {
  return (
    <StSettingWrapper>
      <SettingHeader title="설정" />
      <SettingList />
      <AccountActions />
    </StSettingWrapper>
  );
};

export default Setting;

const StSettingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.White};
`;
