import React, { useState } from 'react';
import styled from 'styled-components';

import KingLogo from '../../assets/icons/king_logo.png'; // ✅ 디폴트 이미지 가져오기
import SettingHeader from './SettingHeader';

const SettingProfile = () => {
  const [profileImage, setProfileImage] = useState(KingLogo); // ✅ 기본 이미지 설정
  const [nickname, setNickname] = useState('Trip Mania King킹');
  const [bio, setBio] = useState(
    "I enjoy watching Korean dramas and love traveling. Currently, I'm exploring new destinations!",
  );

  const handleSave = () => {
    console.log('닉네임:', nickname);
    console.log('소개:', bio);
    // ✅ 여기에 API 요청 로직 추가 가능
  };

  return (
    <StSettingProfileWrapper>
      <SettingHeader title="프로필 수정" />

      <St.ContentWrapper>
        {/* 프로필 사진 */}
        <St.ProfileImageWrapper>
          <St.ProfileImage src={profileImage} alt="프로필 이미지" />
        </St.ProfileImageWrapper>

        {/* 닉네임 수정 */}
        <St.Section>
          <St.Label>닉네임</St.Label>
          <St.Input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          <St.ErrorMessage>
            닉네임은 영문, 숫자, 마침표, 언더스코어만 입력할 수 있습니다.
          </St.ErrorMessage>
        </St.Section>

        {/* 소개 수정 */}
        <St.Section>
          <St.Label>소개</St.Label>
          <St.TextArea value={bio} onChange={(e) => setBio(e.target.value)} />
        </St.Section>
      </St.ContentWrapper>
      {/* 저장 버튼 */}
      <St.ButtonWrapper>
        <St.SaveButton onClick={handleSave}>저장</St.SaveButton>
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
  ErrorMessage: styled.p`
    font-size: 0.9rem;
    color: red;
    margin-top: 0.5rem;
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
  `,
};
