import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import Nav from '../../components/common/Nav';
import Header from '../common/Header';
import SortingRow from '../common/SortingRow';

const ReviewFeed = () => {
  const { placeId } = useParams();
  return (
    <>
      <Header title={'Review Title'} isOption={false} />

      <LineContainer>
        <SortingRow />
      </LineContainer>

      {/* 사진 그리드 */}
      <Title>여기에 장소ID {placeId} 에 해당하는 인증샷 게시글이 다 보여야 함</Title>
      <Nav />
    </>
  );
};

const LineContainer = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.Gray5};
  border-bottom: 1px solid ${({ theme }) => theme.colors.Gray5};
  padding: 5px 0px;
`;

const Title = styled.h1`
  ${({ theme }) => theme.fonts.Title3};
  margin: 0;
`;

export default ReviewFeed;
