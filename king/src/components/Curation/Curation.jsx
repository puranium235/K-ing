import React, { useState } from 'react';
import styled from 'styled-components';

import sampleImage from '../../assets/dummy/curationimg.png';
import CurationsList from '../Archive/CurationsList';
import Nav from '../common/Nav';
import SearchBar from '../common/SearchBar';
import TopNav from '../common/TopNav';

const Curation = () => {
  const curations = [
    {
      id: 1,
      image: sampleImage,
      author: 'k-ing_Official',
      title: '최애의 흔적을 찾아서 : BTS의 RM편',
      bookmarked: true,
    },
    {
      id: 2,
      image: sampleImage,
      author: 'hsmoon101',
      title: '바닷가 근처 드라마 촬영지.zip',
      bookmarked: true,
    },
    {
      id: 3,
      image: sampleImage,
      author: 'hsmoon101',
      title: '바닷가 근처 드라마 촬영지.zip',
      bookmarked: true,
    },
    {
      id: 4,
      image: sampleImage,
      author: 'hsmoon101',
      title: '바닷가 근처 드라마 촬영지.zip',
      bookmarked: true,
    },
    {
      id: 5,
      image: sampleImage,
      author: 'hsmoon101',
      title: '바닷가 근처 드라마 촬영지.zip',
      bookmarked: true,
    },
    {
      id: 6,
      image: sampleImage,
      author: 'hsmoon101',
      title: '바닷가 근처 드라마 촬영지.zip',
      bookmarked: true,
    },
    {
      id: 7,
      image: sampleImage,
      author: 'hsmoon101',
      title: '바닷가 근처 드라마 촬영지.zip',
      bookmarked: true,
    },
    {
      id: 8,
      image: sampleImage,
      author: 'hsmoon101',
      title: '바닷가 근처 드라마 촬영지.zip',
      bookmarked: true,
    },
  ];

  return (
    <>
      <StCurationWrapper>
        <FixedContainer>
          <TopNav />
          <SearchBar />
        </FixedContainer>
        <CurationsList data={curations} />
      </StCurationWrapper>
      <Nav />
    </>
  );
};

export default Curation;

const StCurationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;
  text-align: center;

  padding: 2rem;
  margin-bottom: 7rem;
`;

const FixedContainer = styled.div`
  /* position: sticky;
  top: 0;
  z-index: 1000; */
`;
