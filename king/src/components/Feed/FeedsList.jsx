import React from 'react';
import styled from 'styled-components';

import PostItem from './PostItem';

const FeedsList = ({ data, columns }) => {
  return (
    <St.List $columns={columns}>
      {data.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </St.List>
  );
};

export default FeedsList;

const St = {
  List: styled.div`
    display: grid;
    grid-template-columns: repeat(${(props) => props.$columns}, 1fr);
    gap: 0.7rem;
    overflow-y: auto;
    padding: 0.5rem;
  `,
};
