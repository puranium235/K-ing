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
  padding: 2rem;
`;

const ProfileImage = styled.img`
  width: 8rem;
  height: 8rem;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
`;

const Nickname = styled.h2`
  margin: 5px 0;
  font-size: 2rem;
`;

const Email = styled.p`
  font-size: 1.4rem;
  color: #888;
`;

const Bio = styled.p`
  font-size: 1.4rem;
  color: #555;
`;
