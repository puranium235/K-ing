import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import { getUserProfile } from '../../lib/user';
import { ProfileState } from '../../recoil/atom';
import Loading from '../Loading/Loading';
import CurationsList from './CurationsList';
import PostsGrid from './PostsGrid';
import ProfileHeader from './ProfileHeader';
import ProfileTabMenu from './ProfileTabMenu';
import SettingsButton from './SettingsButton';

function Profile({ isMyPage, userId }) {
  const [profileData, setProfileData] = useRecoilState(ProfileState);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        console.log(`🔍 요청 URL: /user/${userId}`);
        const data = await getUserProfile(userId);
        console.log(data);
        if (isMounted) setProfileData(data.data);
      } catch (error) {
        if (isMounted) setProfileData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false; // ✅ 컴포넌트가 언마운트되면 API 요청 방지
    };
  }, [userId]);

  if (loading) return <Loading />;
  if (!profileData) {
    return (
      <ErrorContainer>
        <RefreshButton onClick={() => window.location.reload()}>🔄</RefreshButton>
      </ErrorContainer>
    );
  }

  console.log('🟢 isMyPage:', isMyPage);
  console.log('🟢 userId:', userId);

  return (
    <ProfileContainer>
      <ProfileHeaderWrapper>
        <ProfileHeader user={profileData} isMyPage={isMyPage} />
        {isMyPage && <SettingsButton isMyPage={isMyPage} />}
      </ProfileHeaderWrapper>
      {/* ✅ ProfileTabs 적용 */}
      <ProfileTabMenu activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'posts' ? (
        <PostsGrid posts={profileData.posts || []} isMyPage={isMyPage} />
      ) : (
        <CurationsList
          curations={profileData.curations || []}
          isMyPage={isMyPage}
          userId={userId}
        />
      )}
    </ProfileContainer>
  );
}

export default Profile;

const ProfileContainer = styled.div`
  width: 100%;
  max-width: 60rem;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
  position: relative;
`;

const ProfileHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between; /* ✅ 좌우 정렬 */
  align-items: center; /* ✅ 세로 중앙 정렬 */
  width: 100%;
  position: relative;
  box-sizing: border-box;
  padding: 2rem;
`;
// ✅ 유저 정보를 불러오지 못했을 때의 스타일
const ErrorContainer = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const RefreshButton = styled.button`
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  font-size: 1.4rem;
  background-color: ${({ theme }) => theme.colors.Primary || '#007bff'};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: ${({ theme }) => theme.colors.PrimaryDark || '#0056b3'};
  }
`;
