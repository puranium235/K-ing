import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import Nav from '../../components/common/Nav';
import Bottom from '../common/Bottom';
import Header from '../common/Header';
import SortingRow from '../common/SortingRow';
import ImageGrid from './ImageGrid';

const ReviewFeed = () => {
  const { placeId } = useParams();

  const images = [
    '/src/assets/dummy/place.png',
    '/src/assets/dummy/place.png',
    '/src/assets/dummy/place.png',
    '/src/assets/dummy/place.png',
    '/src/assets/dummy/place.png',
    '/src/assets/dummy/place.png',
    '/src/assets/dummy/place.png',
    '/src/assets/dummy/place.png',
    '/src/assets/dummy/place.png',
    '/src/assets/dummy/place.png',
    '/src/assets/dummy/place.png',
  ];

  return (
    <>
      <Header title={'Review Title'} isOption={false} />

      <LineContainer>
        <SortingRow />
      </LineContainer>

      <ImageGrid images={images} />
      <Bottom />
      <Nav />
    </>
  );
};

const LineContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.Gray5};
  border-bottom: 1px solid ${({ theme }) => theme.colors.Gray5};
  padding: 0.5rem 0;
`;

export default ReviewFeed;
