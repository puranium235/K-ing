import React from 'react';
import styled from 'styled-components';

const UserProfile = ({ name, date, profileImage }) => {
  return (
    <ProfileContainer>
      <ProfileImage src={profileImage} alt="Profile" />
      <ProfileInfo>
        <UserName>{name}</UserName>
        <Date>{date}</Date>
      </ProfileInfo>
    </ProfileContainer>
  );
};

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  ${({ theme }) => theme.fonts.Title6};
  color: ${({ theme }) => theme.colors.Gray0};
  margin-bottom: 5px;
`;

const Date = styled.span`
  ${({ theme }) => theme.fonts.Body5};
  color: ${({ theme }) => theme.colors.Gray1};
`;

export default UserProfile;
