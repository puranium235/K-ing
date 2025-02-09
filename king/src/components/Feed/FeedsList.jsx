import React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import useGetFeedList from '../../hooks/feed/useGetFeedList';
import Loading from '../Loading/Loading';
import PostItem from './PostItem';

const FeedsList = ({ columns }) => {
  const lastElementRef = useRef(null);

  const { feedList, getNextData, isLoading, hasMore } = useGetFeedList();

  const catchLastItem = (isLoading, lastElementRef, getNextData, hasMore) => {
    if (isLoading || !lastElementRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          getNextData();
        }
      },
      { threshold: 0.5 },
    );

    if (lastElementRef.current) {
      observer.observe(lastElementRef.current);
    }

    return () => {
      if (lastElementRef.current) {
        observer.unobserve(lastElementRef.current);
      }
    };
  };

  useEffect(() => {
    catchLastItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  if (isLoading && feedList.length === 0) return <Loading />;

  return (
    <StList $columns={columns}>
      {feedList.map((post, index) => (
        <PostItem
          key={post.postId}
          post={post}
          column={columns}
          ref={index === feedList.length - 1 ? lastElementRef : null}
        />
      ))}
    </StList>
  );
};

export default FeedsList;

const StList = styled.div`
  display: grid;
  grid-template-columns: repeat(${(props) => props.$columns}, 1fr);
  gap: 0.7rem;
  overflow-y: auto;
  padding: 0.5rem 2rem;

  width: 100%;
`;
