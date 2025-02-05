import React, { useState } from 'react';
import styled from 'styled-components';

import { PostsDummyData } from '../../assets/dummy/dummyDataPosts';
import { IcOne, IcOneSelected, IcTwo, IcTwoSelected } from '../../assets/icons';
import Nav from '../common/Nav';
import TopNav from '../common/TopNav';
import FeedsList from './FeedsList';

const Feed = () => {
  const [columns, setColumns] = useState(2);

  const posts = PostsDummyData;

  return (
    <>
      <StFeedWrapper>
        <FixedContainer>
          <TopNav />
          <FilterWrapper>
            {columns === 1 ? (
              <IcOneSelected onClick={() => setColumns(1)} />
            ) : (
              <IcOne onClick={() => setColumns(1)} />
            )}
            {columns === 2 ? (
              <IcTwoSelected onClick={() => setColumns(2)} />
            ) : (
              <IcTwo onClick={() => setColumns(2)} />
            )}
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
  padding: 2rem;
  margin-bottom: 7rem;
`;

const FixedContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;
  /* padding: 0 2rem; */
  width: 100%;
  background-color: ${({ theme }) => theme.colors.White};
`;

const FilterWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: end;

  box-sizing: border-box;
  padding: 0 1rem;
  margin-bottom: 1rem;
  gap: 0.5rem;

  width: 100%;

  svg {
    cursor: pointer;
  }
`;
