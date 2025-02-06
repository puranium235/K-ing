import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import SettingDeleteAccount from './SettingDeleteAccount';
import SettingProfile from './SettingProfile';

const SettingDetail = () => {
  const { settingType } = useParams();

  const renderSettingComponent = () => {
    switch (settingType) {
      case 'profile':
        return <SettingProfile />;
      case 'delete-account':
        return <SettingDeleteAccount />;
      case 'notification':
        return <div>알림 설정 페이지</div>;
      case 'language':
        return <div>언어 설정 페이지</div>;
      default:
        return <div>잘못된 접근입니다.</div>;
    }
  };

  return <StSettingDetailWrapper>{renderSettingComponent()}</StSettingDetailWrapper>;
};

export default SettingDetail;

const StSettingDetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
