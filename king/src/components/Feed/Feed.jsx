import React from 'react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { PostsDummyData } from '../../assets/dummy/dummyDataPosts';
import { IcOne, IcTwo } from '../../assets/icons';
import Nav from '../common/Nav';
import TopNav from '../common/TopNav';
import FeedsList from './FeedsList';

const Feed = () => {
  const [columns, setColumns] = useState(2);

  const handle = (num) => {
    setColumns(num);
  };

  const posts = PostsDummyData;

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
