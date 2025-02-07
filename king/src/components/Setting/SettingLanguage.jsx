import React, { useState } from 'react';
import styled from 'styled-components';

import SettingHeader from './SettingHeader';

const languages = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
];

const SettingLanguage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('ko');

  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
    console.log(`언어 변경됨: ${languageCode}`);
  };

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
    border-bottom: 0.1rem solid ${({ theme }) => theme.colors.Gray2}; /* ✅ 구분선 추가 */
    cursor: pointer;
  `,
  LanguageText: styled.p`
    ${({ theme }) => theme.fonts.Body2}; /* ✅ 폰트 통일 */
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
