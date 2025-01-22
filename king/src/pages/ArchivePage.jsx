import React, { useState } from 'react';
import styled from 'styled-components';

import {
  curationsDummyData,
  favoritePeopleDummyData,
  favoriteWorksDummyData,
} from '../assets/dummy/dummyDataArchive';
import ArchiveHeader from '../components/Archive/ArchiveHeader';
import ArchiveTabMenu from '../components/Archive/ArchiveTabMenu';
import CurationsList from '../components/Archive/CurationsList';
import FavoritesList from '../components/Archive/FavoritesList';

const ArchivePage = () => {
  const [activeTab, setActiveTab] = useState('Curations');

  // dummy data (assets/dummy/dummyDataArchive.js)
  const [curationsData, setCurationsData] = useState(curationsDummyData);
  const [favoriteWorksData, setFavoriteWorksData] = useState(favoriteWorksDummyData);
  const [favoritePeopleData, setFavoritePeopleData] = useState(favoritePeopleDummyData);

  return (
    <St.Page>
      <St.Header>
        <St.Header>Archive</St.Header>
      </St.Header>
      <ArchiveTabMenu onTabChange={(tab) => setActiveTab(tab)} />
      {activeTab === 'Curations' && <CurationsList data={curationsData} />}
      {activeTab === 'Favorites' && (
        <>
          <FavoritesList title="작품" data={favoriteWorksData} />
          <FavoritesList title="인물" data={favoritePeopleData} />
        </>
      )}
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
    padding: 10px;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
  `,
};
