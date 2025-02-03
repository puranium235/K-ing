import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
  CurationsDummyData,
  FavoritePeopleDummyData,
  FavoriteWorksDummyData,
} from '../../assets/dummy/dummyDataArchive';
import Nav from '../common/Nav';
import ArchiveTabMenu from './ArchiveTabMenu';
import CurationsList from './CurationsList';
import FavoritesList from './FavoritesList';

const Archive = () => {
  const location = useLocation();

  // 새로고침 상태 확인 및 기본값 설정
  const initialTab = location.state?.activeTab || 'Curations';
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('activeTab') || initialTab;
  });

  useEffect(() => {
    // activeTab을 세션 스토리지에 저장
    sessionStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const [curationsData] = useState(CurationsDummyData);
  const [favoriteWorksData] = useState(FavoriteWorksDummyData);
  const [favoritePeopleData] = useState(FavoritePeopleDummyData);

  return (
    <St.Container>
      <St.Header>Archive</St.Header>
      <ArchiveTabMenu activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'Curations' && <CurationsList data={curationsData} />}
      {activeTab === 'Favorites' && (
        <>
          <FavoritesList title="작품" data={favoriteWorksData} onTabChange={setActiveTab} />
          <FavoritesList title="인물" data={favoritePeopleData} onTabChange={setActiveTab} />
        </>
      )}
      <Nav />
    </St.Container>
  );
};

export default Archive;

const St = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
  `,
  Header: styled.header`
    position: sticky;
    top: 0;
    background-color: ${({ theme }) => theme.colors.White};
    z-index: 10;
    padding: 2rem;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
  `,
};
