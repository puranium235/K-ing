import React from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { updateNotificationSetting } from '../../lib/user';
import { ProfileState } from '../../recoil/atom';
import SettingHeader from './SettingHeader';

const SettingNotification = () => {
  const [profile, setProfile] = useRecoilState(ProfileState);
  const isToggled = profile.contentAlarmOn || false;

  const handleToggle = async () => {
    const newToggleState = !isToggled;

    try {
      // 🔹 API 요청 (알람 설정 변경)
      const response = await updateNotificationSetting(newToggleState);
      console.log('✅ 알람 설정 변경 성공:', response);

      // 🔹 Recoil 상태 업데이트
      setProfile((prev) => ({
        ...prev,
        contentAlarmOn: response.data.contentAlarmOn,
      }));
    } catch (error) {
      console.error('❌ 알람 설정 변경 실패:', error);
      alert('알람 설정 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <StSettingNotificationWrapper>
      <SettingHeader title="알림" />
      <St.NotificationWrapper>
        <St.TextWrapper>
          <St.Title>서비스 앱 푸시 알림</St.Title>
          <St.Description>관심있는 촬영지 정보를 빠르게 알려드릴게요.</St.Description>
        </St.TextWrapper>

        {/* ✅ 토글 버튼 (배경 고정 & 부드러운 애니메이션 적용) */}
        <St.ToggleWrapper onClick={handleToggle} $isToggled={isToggled}>
          <St.ToggleBall $isToggled={isToggled} />
        </St.ToggleWrapper>
      </St.NotificationWrapper>
    </StSettingNotificationWrapper>
  );
};

export default SettingNotification;

const StSettingNotificationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const St = {
  NotificationWrapper: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2.5rem;
  `,
  TextWrapper: styled.div`
    display: flex;
    flex-direction: column;
  `,
  Title: styled.p`
    ${({ theme }) => theme.fonts.Title5};
    font-weight: bold;
  `,
  Description: styled.p`
    ${({ theme }) => theme.fonts.Body4};
    color: ${({ theme }) => theme.colors.Gray2};
    margin-top: 0.5rem;
  `,
  ToggleWrapper: styled.div`
    width: 4rem;
    height: 2rem;
    background-color: ${({ theme, $isToggled }) =>
      $isToggled ? theme.colors.Gray1 : theme.colors.Gray3};
    border-radius: 1.5rem;
    display: flex;
    align-items: center;
    padding: 0.2rem;
    cursor: pointer;
    transition: background-color 0.3s ease-in-out;
  `,
  ToggleBall: styled.div`
    width: 1.6rem;
    height: 1.6rem;
    background-color: white;
    border-radius: 50%;
    transform: ${({ $isToggled }) => ($isToggled ? 'translateX(2rem)' : 'translateX(0)')};
    transition: transform 0.3s ease-in-out;
  `,
};
