import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import KingLogo from '../../assets/icons/king_logo.png';
import { checkNickname } from '../../lib/auth';
import commonLocales from '../../locales/common.json';
import profileLocales from '../../locales/profile.json';
import signupLocales from '../../locales/signup.json';
import SettingHeader from './SettingHeader';

const SettingProfile = () => {
  const [profileImage, setProfileImage] = useState(KingLogo);
  const [nickname, setNickname] = useState('Trip Mania King킹');
  const [bio, setBio] = useState(
    "I enjoy watching Korean dramas and love traveling. Currently, I'm exploring new destinations!",
  );

  const [isValidName, setIsValidName] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [language, setLanguage] = useState('ko'); // 기본 언어 설정
  const [translations, setTranslations] = useState(signupLocales[language]);
  const [commonTranslations, setCommonTranslations] = useState(commonLocales[language]);
  const [profileTranslations, setProfileTranslations] = useState(profileLocales[language]);

  // ✅ 토큰에서 언어 설정 가져오기
  useEffect(() => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const decoded = jwtDecode(accessToken);
        if (decoded.language) {
          setLanguage(decoded.language);
          setTranslations(signupLocales[decoded.language]);
          setCommonTranslations(commonLocales[decoded.language]);
          setProfileTranslations(profileLocales[decoded.language]);
        }
      }
    } catch (error) {
      console.error('토큰 디코딩 실패:', error);
    }
  }, []);

  // ✅ 닉네임 입력 핸들러
  const handleNicknameChange = (e) => {
    setNickname(e.target.value);
  };

  // ✅ 닉네임 유효성 검사 (공백 제거 & 길이 체크만 적용)
  useEffect(() => {
    const trimmedName = nickname.trim();

    if (nickname.length === 0) {
      setIsValidName(false);
      setErrorMessage(translations.nicknameErrorLength);
    } else if (trimmedName.length === 0) {
      setIsValidName(false);
      setErrorMessage(translations.nicknameErrorWhitespace);
    } else if (trimmedName.length > 50) {
      setIsValidName(false);
      setErrorMessage(translations.nicknameErrorLength);
    } else {
      setIsValidName(true);
      setErrorMessage('');
    }
  }, [nickname, translations]);

  // ✅ 닉네임 중복 검사 (500ms 디바운싱 적용)
  useEffect(() => {
    if (!isValidName) return;

    setCheckingName(true);
    const timer = setTimeout(async () => {
      const { success, message } = await checkNickname(nickname, language);
      setIsNameAvailable(success);

      if (!success) {
        setErrorMessage(message);
      }

      setCheckingName(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [nickname, isValidName]);

  const handleSave = () => {
    if (!isValidName || !isNameAvailable) {
      alert(translations.nicknameErrorDuplicate);
      return;
    }

    console.log('닉네임:', nickname);
    console.log('소개:', bio);
    // ✅ API 요청 로직 추가 가능
  };

  return (
    <StSettingProfileWrapper>
      <SettingHeader title={profileTranslations.editProfile} />

      <St.ContentWrapper>
        {/* 프로필 사진 */}
        <St.ProfileImageWrapper>
          <St.ProfileImage src={profileImage} alt="프로필 이미지" />
        </St.ProfileImageWrapper>

        {/* 닉네임 수정 */}
        <St.Section>
          <St.Label>{profileTranslations.nickname}</St.Label>
          <St.Input type="text" value={nickname} onChange={handleNicknameChange} />
          <St.StatusMessageWrapper>
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            {checkingName && <InfoMessage>{translations.nicknameChecking}</InfoMessage>}
            {isValidName && isNameAvailable && (
              <SuccessMessage>{translations.nicknameAvailable}</SuccessMessage>
            )}
          </St.StatusMessageWrapper>
        </St.Section>

        {/* 소개 수정 */}
        <St.Section>
          <St.Label>{profileTranslations.bio}</St.Label>
          <St.TextArea value={bio} onChange={(e) => setBio(e.target.value)} />
        </St.Section>
      </St.ContentWrapper>

      {/* 저장 버튼 */}
      <St.ButtonWrapper>
        <St.SaveButton disabled={!isValidName || !isNameAvailable} onClick={handleSave}>
          {commonTranslations.save}
        </St.SaveButton>
      </St.ButtonWrapper>
    </StSettingProfileWrapper>
  );
};

export default SettingProfile;

const StSettingProfileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const St = {
  ContentWrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
  `,
  ProfileImageWrapper: styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
  `,
  ProfileImage: styled.img`
    width: 10rem;
    height: 10rem;
    border-radius: 50%;
    object-fit: cover;
    border: 0.1rem solid ${({ theme }) => theme.colors.Gray3};
  `,

  Section: styled.div`
    width: 100%;
    margin-bottom: 2rem;
  `,
  Label: styled.label`
    ${({ theme }) => theme.fonts.Body3}
    font-weight: bold;
    display: block;
    margin-bottom: 0.5rem;
  `,
  Input: styled.input`
    width: 100%;
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.colors.Gray2};
    border-radius: 5px;
    box-sizing: border-box;
  `,
  TextArea: styled.textarea`
    width: 100%;
    height: 80px;
    padding: 1rem;
    border: 1px solid ${({ theme }) => theme.colors.Gray2};
    border-radius: 5px;
    resize: none;
    box-sizing: border-box;
  `,
  StatusMessageWrapper: styled.div`
    height: 1.6rem;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding-top: 0.5rem;
  `,
  ButtonWrapper: styled.div`
    display: flex;
    justify-content: center;
    margin-top: auto;
    padding-bottom: 2rem;
  `,
  SaveButton: styled.button`
    width: 90%;
    padding: 1rem;
    background-color: ${({ theme }) => theme.colors.Gray1};
    color: white;
    ${({ theme }) => theme.fonts.Title6};
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
    &:disabled {
      background-color: ${({ theme }) => theme.colors.Gray3};
      cursor: not-allowed;
    }
  `,
};

const ErrorMessage = styled.p`
  color: red;
  font-size: 1.2rem;
  margin-top: 0.5rem;
`;

const InfoMessage = styled.p`
  color: ${({ theme }) => theme.colors.Gray1};
  font-size: 1.2rem;
  margin-top: 0.5rem;
`;

const SuccessMessage = styled.p`
  color: green;
  font-size: 1.2rem;
  margin-top: 0.5rem;
`;
