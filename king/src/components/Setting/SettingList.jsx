import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import SettingItem from './SettingItem';
const settings = [
  { title: '프로필 수정', type: 'profile' },
  { title: '알림', type: 'notification' },
  { title: '언어', type: 'language' },
];

const SettingList = () => {
  const navigate = useNavigate();
  return (
    <StSettingListWrapper>
      {settings.map((setting) => (
        <SettingItem
          key={setting.type}
          title={setting.title}
          type={setting.type}
          onClick={() => navigate(`/setting/${setting.type}`)}
        />
      ))}
    </StSettingListWrapper>
  );
};

export default SettingList;

const StSettingListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;
