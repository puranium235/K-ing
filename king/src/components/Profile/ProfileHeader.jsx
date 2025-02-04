import styled from 'styled-components';

function ProfileHeader({ user }) {
  return (
    <HeaderContainer>
      <ProfileImage src={user.profileImage} alt="Profile" />
      <Nickname>{user.nickname}</Nickname>
      <Email>{user.email}</Email>
      <Bio>{user.bio}</Bio>
    </HeaderContainer>
  );
}

export default ProfileHeader;

const HeaderContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const ProfileImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
`;

const Nickname = styled.h2`
  margin: 5px 0;
  font-size: 20px;
`;

const Email = styled.p`
  font-size: 14px;
  color: #888;
`;

const Bio = styled.p`
  font-size: 14px;
  color: #555;
`;
