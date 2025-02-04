import axios from 'axios';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import Loading from '../Loading/Loading';
import CurationsGrid from './CurationsGrid';
import PostsGrid from './PostsGrid';
import ProfileHeader from './ProfileHeader';
import ProfileTabMenu from './ProfileTabMenu';
import SettingsButton from './SettingsButton';

function Profile({ isMyPage, userId }) {
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  // axios 나중에 분리
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/user/profile/${userId}`);
        setProfileData(response.data);
      } catch (error) {
        console.error('프로필 데이터를 불러오는 중 오류 발생:', error);
        setProfileData({ posts: [], curations: [] }); // 🔥 기본값 설정
      } finally {
        setLoading(false); // 로딩 종료
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) return <Loading />;

  return (
    <ProfileContainer>
      <ProfileHeader user={profileData} />
      <SettingsButton isMyPage={isMyPage} />

      {/* ✅ ProfileTabs 적용 */}
      <ProfileTabMenu activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'posts' ? (
        <PostsGrid posts={profileData.posts || []} isMyPage={isMyPage} />
      ) : (
        <CurationsGrid curations={profileData.curations || []} isMyPage={isMyPage} />
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
`;
