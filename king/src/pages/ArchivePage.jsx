import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import {
  curationsDummyData,
  favoritePeopleDummyData,
  favoriteWorksDummyData,
} from '../assets/dummy/dummyDataArchive';
import ArchiveTabMenu from '../components/Archive/ArchiveTabMenu';
import CurationsList from '../components/Archive/CurationsList';
import FavoritesList from '../components/Archive/FavoritesList';
import Nav from '../components/common/Nav';

const ArchivePage = () => {
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

  const [curationsData] = useState(curationsDummyData);
  const [favoriteWorksData] = useState(favoriteWorksDummyData);
  const [favoritePeopleData] = useState(favoritePeopleDummyData);

  return (
    <St.Page>
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
    </St.Page>
  );
};

export default ArchivePage;

const St = {
  Page: styled.div`
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

const ListWrapper = styled.div`
  padding: 16px;
`;
