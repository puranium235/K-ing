import React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import sampleImage from '../../assets/dummy/curationimg.png';
import { IcOne, IcTwo } from '../../assets/icons';
import Nav from '../common/Nav';
import TopNav from '../common/TopNav';
import FeedsList from './FeedsList';

const Feed = () => {
  const [columns, setColumns] = useState(2);

  const handle = (num) => {
    setColumns(num);
  };

  const posts = [
    {
      id: 1,
      image: sampleImage,
      author: 'k-ing_Official',
      title: 'BTS 뮤비 촬영지 드디어 왔다.!!! 생각보다 별거없네ㅠㅜ ㅋㅋㅋㅋ',
      date: '24.01.07',
      likes: 30,
      comments: 12,
    },
    {
      id: 2,
      image: sampleImage,
      author: 'k-ing_Official',
      title: 'BTS 뮤비 촬영지 드디어 왔다.!!! 생각보다 별거없네ㅠㅜ ㅋㅋㅋㅋ',
      date: '24.01.07',
      likes: 30,
      comments: 12,
    },
    {
      id: 3,
      image: sampleImage,
      author: 'k-ing_Official',
      title: 'BTS 뮤비 촬영지 드디어 왔다.!!! 생각보다 별거없네ㅠㅜ ㅋㅋㅋㅋ',
      date: '24.01.07',
      likes: 30,
      comments: 12,
    },
    {
      id: 4,
      image: sampleImage,
      author: 'k-ing_Official',
      title: 'BTS 뮤비 촬영지 드디어 왔다.!!! 생각보다 별거없네ㅠㅜ ㅋㅋㅋㅋ',
      date: '24.01.07',
      likes: 30,
      comments: 12,
    },
    {
      id: 5,
      image: sampleImage,
      author: 'k-ing_Official',
      title: 'BTS 뮤비 촬영지 드디어 왔다.!!! 생각보다 별거없네ㅠㅜ ㅋㅋㅋㅋ',
      date: '24.01.07',
      likes: 30,
      comments: 12,
    },
    {
      id: 6,
      image: sampleImage,
      author: 'k-ing_Official',
      title: 'BTS 뮤비 촬영지 드디어 왔다.!!! 생각보다 별거없네ㅠㅜ ㅋㅋㅋㅋ',
      date: '24.01.07',
      likes: 30,
      comments: 12,
    },
    {
      id: 7,
      image: sampleImage,
      author: 'k-ing_Official',
      title: 'BTS 뮤비 촬영지 드디어 왔다.!!! 생각보다 별거없네ㅠㅜ ㅋㅋㅋㅋ',
      date: '24.01.07',
      likes: 30,
      comments: 12,
    },
    {
      id: 8,
      image: sampleImage,
      author: 'k-ing_Official',
      title: 'BTS 뮤비 촬영지 드디어 왔다.!!! 생각보다 별거없네ㅠㅜ ㅋㅋㅋㅋ',
      date: '24.01.07',
      likes: 30,
      comments: 12,
    },
  ];

  return (
    <>
      <StFeedWrapper>
        <FixedContainer>
          <TopNav />
          <FilterWrapper>
            <IcOne onClick={() => setColumns(1)} />
            <IcTwo onClick={() => setColumns(2)} />
          </FilterWrapper>
        </FixedContainer>
        <FeedsList data={posts} columns={columns} />
      </StFeedWrapper>
      <Nav />
    </>
  );
};

export default Feed;

const StFeedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  padding: 2rem;
  margin-bottom: 7rem;
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;

  box-sizing: border-box;
  padding: 0 1rem;
  margin-bottom: 0.5rem;
  gap: 0.5rem;

  width: 100%;
`;

const FixedContainer = styled.div`
  /* position: sticky;
  top: 0;
  z-index: 1000; */
`;
