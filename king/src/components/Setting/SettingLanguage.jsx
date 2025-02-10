import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { updateUserProfile } from '../../lib/user';
import { getUserProfile } from '../../lib/user';
import { ProfileState } from '../../recoil/atom';
import SettingHeader from './SettingHeader';

const languages = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
];

const SettingLanguage = () => {
  const [profile, setProfile] = useRecoilState(ProfileState);
  const [selectedLanguage, setSelectedLanguage] = useState(profile.language || 'ko');

  const handleLanguageChange = async (languageCode) => {
    setSelectedLanguage(languageCode);

    try {
      // 🔹 API 요청 (서버에 언어 변경)
      const updatedProfile = await updateUserProfile({ language: languageCode });

      // 🔹 Recoil 상태 업데이트
      setProfile((prev) => ({
        ...prev,
        language: updatedProfile.data.language,
      }));

      console.log(`🌍 언어 변경 성공: ${updatedProfile.data.language}`);
    } catch (error) {
      console.error('❌ 언어 변경 실패:', error);
      alert('언어 변경 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!profile || !profile.nickname) {
          // ✅ Recoil 상태가 비어 있을 때만 요청
          const data = await getUserProfile(jwtDecode(accessToken).userId);
          setProfile(data.data); // ✅ Recoil 상태 업데이트
        }
      } catch (error) {
        console.error('❌ 프로필 데이터를 불러오는 중 오류 발생:', error);
      }
    };

    fetchProfile();
  }, [setProfile]);

  return (
    <StSettingLanguageWrapper>
      <SettingHeader title="언어" />
      <St.LanguageList>
        {languages.map((lang) => (
          <St.LanguageItem key={lang.code} onClick={() => handleLanguageChange(lang.code)}>
            <St.LanguageText>{lang.label}</St.LanguageText>
            <St.RadioButton $isSelected={selectedLanguage === lang.code} />
          </St.LanguageItem>
        ))}
      </St.LanguageList>
    </StSettingLanguageWrapper>
  );
};

export default SettingLanguage;

const StSettingLanguageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const St = {
  LanguageList: styled.div`
    display: flex;
    flex-direction: column;
  `,
  LanguageItem: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    border-bottom: 0.1rem solid ${({ theme }) => theme.colors.Gray2};
    cursor: pointer;
  `,
  LanguageText: styled.p`
    ${({ theme }) => theme.fonts.Body2};
  `,
  RadioButton: styled.div`
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 0.2rem solid ${({ theme }) => theme.colors.Gray3};
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease-in-out;

    &:before {
      content: '';
      width: 1.3rem;
      height: 1.3rem;
      border-radius: 50%;
      background-color: ${({ theme, $isSelected }) =>
        $isSelected ? theme.colors.Gray1 : 'transparent'};
      transition: background-color 0.2s ease-in-out;
    }
  `,
};
