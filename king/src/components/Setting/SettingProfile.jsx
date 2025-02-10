import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import KingLogo from '../../assets/icons/king_logo.png';
import { checkNickname } from '../../lib/auth';
import { getUserProfile, updateUserProfile } from '../../lib/user';
import commonLocales from '../../locales/common.json';
import profileLocales from '../../locales/profile.json';
import signupLocales from '../../locales/signup.json';
import { ProfileState } from '../../recoil/atom';
import SettingHeader from './SettingHeader';

const SettingProfile = () => {
  const [profile, setProfile] = useRecoilState(ProfileState);
  const { imageUrl, nickname, description } = profile || {}; // Recoil 상태에서 가져오기 구조분해 할당

  const [selectedImage, setSelectedImage] = useState(imageUrl); // 미리보기용 이미지
  const [imageFile, setImageFile] = useState(null); // 업로드할 파일 저장
  const fileInputRef = useRef(null); // 파일 선택창 참조

  const [newNickname, setNewNickname] = useState(nickname || '');
  const [newDescription, setNewDescription] = useState(description || '');

  const [isValidName, setIsValidName] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [language, setLanguage] = useState('ko'); // 기본 언어 설정
  const [translations, setTranslations] = useState(signupLocales[language]);
  const [commonTranslations, setCommonTranslations] = useState(commonLocales[language]);
  const [profileTranslations, setProfileTranslations] = useState(profileLocales[language]);

  // console.log('🟠 SettingProfile.jsx에서 Recoil profileImage:', imageUrl);

  // 프로필 이미지 클릭 시 파일 선택창 열기
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // 선택한 이미지 미리보기 업데이트
  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // 🔹 파일 크기 체크 (5MB 초과 시 업로드 차단)
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_SIZE) {
        alert('이미지 파일 크기가 5MB를 초과할 수 없습니다.');
        setErrorMessage('이미지 파일 크기는 최대 5MB까지 업로드 가능합니다.');
        return; // ✅ 5MB 초과 시 setSelectedImage, setImageFile 실행 안 함
      }

      // ✅ 정상적인 경우에만 이미지 설정
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setImageFile(file);
      setErrorMessage(''); // 기존 에러 메시지 초기화
    }
  };

  // 새로고침 시 Recoil 상태가 초기화되므로 서버에서 데이터 다시 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!profile || !profile.nickname) {
          // ✅ Recoil 상태가 비어있을 때만 요청
          const data = await getUserProfile(jwtDecode(accessToken).userId);
          setProfile(data.data); // ✅ Recoil 상태 업데이트
        }
      } catch (error) {
        console.error('❌ 프로필 데이터를 불러오는 중 오류 발생:', error);
      }
    };

    fetchProfile();
  }, [setProfile]);

  // 닉네임 유효성 검사
  useEffect(() => {
    const trimmedName = newNickname.trim();

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
  }, [newNickname, translations]);

  // ✅ 닉네임 중복 검사 (기존 닉네임이면 검사 생략)
  useEffect(() => {
    if (!isValidName) return;

    if (newNickname === nickname) {
      setIsNameAvailable(true);
      setErrorMessage('');
      return;
    }

    setCheckingName(true);
    const timer = setTimeout(async () => {
      const { success, message } = await checkNickname(newNickname, language);
      setIsNameAvailable(success);

      if (!success) {
        setErrorMessage(message);
      }

      setCheckingName(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [newNickname, isValidName]);

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

  // 변경 사항 저장
  const handleSave = async () => {
    if (!isValidName || !isNameAvailable) {
      alert(translations.nicknameErrorDuplicate);
      return;
    }

    try {
      const updatedProfile = {};

      // ✅ 변경된 값만 저장
      if (newNickname !== nickname) updatedProfile.nickname = newNickname;
      if (newDescription !== description) updatedProfile.description = newDescription;

      if (Object.keys(updatedProfile).length === 0 && !imageFile) {
        alert('변경된 사항이 없습니다.');
        return;
      }

      console.log('📤 업데이트 요청 데이터:', updatedProfile);

      // ✅ API 호출
      const response = await updateUserProfile(updatedProfile, imageFile);

      console.log('✅ 업데이트 성공:', response);

      // ✅ Recoil 상태 업데이트
      setProfile((prev) => ({
        ...prev,
        ...updatedProfile, // 변경된 값만 반영
        imageUrl: response.data.imageUrl || prev.imageUrl, // 이미지가 변경되지 않았다면 기존 이미지 유지
      }));

      alert('프로필이 저장되었습니다!');
    } catch (error) {
      console.error('❌ 프로필 저장 실패:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
      console.log(imageFile.size);
    }
  };

  return (
    <StSettingProfileWrapper>
      <SettingHeader title={profileTranslations.editProfile} />

      <St.ContentWrapper>
        {/* 프로필 사진 */}
        <St.ProfileImageWrapper onClick={handleImageClick}>
          <St.ProfileImage src={selectedImage} alt="프로필 이미지" />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />
        </St.ProfileImageWrapper>

        {/* 닉네임 수정 */}
        <St.Section>
          <St.Label>{profileTranslations.nickname}</St.Label>
          <St.Input
            type="text"
            value={newNickname}
            onChange={(e) => setNewNickname(e.target.value)}
          />
          <St.StatusMessageWrapper>
            {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
            {isValidName && isNameAvailable && (
              <SuccessMessage>{translations.nicknameAvailable}</SuccessMessage>
            )}
          </St.StatusMessageWrapper>
        </St.Section>

        {/* 소개 수정 */}
        <St.Section>
          <St.Label>{profileTranslations.description}</St.Label>
          <St.TextArea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
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
