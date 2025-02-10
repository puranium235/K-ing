import React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import useGetCurationList from '../../hooks/user/useGetCurationList';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import Loading from '../Loading/Loading';
import CurationItem from './CurationItem';

const CurationsList = ({ userId }) => {
  const lastElementRef = useRef(null);

  const { curationList, getNextData, isLoading, hasMore } = useGetCurationList(userId);

  useEffect(() => {
    console.log('📌 무한 스크롤 감지:', { isLoading, hasMore });
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  if (isLoading && curationList === 0) return <Loading />;

  console.log('curationList : ', curationList);

  if (!curationList || curationList.length === 0) {
    return <EmptyMessage>등록된 큐레이션이 없습니다.</EmptyMessage>;
  }

  return (
    <GridContainer>
      {curationList.map((curation, index) => (
        <CurationItem
          key={index}
          item={curation}
          ref={index === curationList.length - 1 ? lastElementRef : null}
        />
      ))}
    </GridContainer>
  );
};

export default CurationsList;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2열 그리드 */
  gap: 0.8rem;
  width: 100%;
  padding: 1.6rem;
  box-sizing: border-box;
`;

const EmptyMessage = styled.p`
  text-align: center;
  width: 100%;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.Gray2};
  box-sizing: border-box;
`;
