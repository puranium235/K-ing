import React from 'react';
import styled from 'styled-components';

import SettingItem from './SettingItem';

const settings = [
  { title: '프로필 수정', type: 'profile' },
  { title: '계정 관리', type: 'account' },
  { title: '알림', type: 'notifications' },
  { title: '언어', type: 'language' },
];

const SettingList = () => {
  return (
    <StSettingListWrapper>
      {settings.map((setting) => (
        <SettingItem
          key={setting.type}
          title={setting.title}
          type={setting.type}
          onClick={() => navigate(`/settings/${setting.type}`)}
        />
      ))}
    </StSettingListWrapper>
  );
};

export default SettingList;

const StSettingListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const StItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 0.1rem solid ${({ theme }) => theme.colors.Gray2};
  cursor: pointer;
`;

const StArrow = styled.span`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.Gray3};
`;
