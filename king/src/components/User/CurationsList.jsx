import React from 'react';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';

import useGetCurationList from '../../hooks/user/useGetCurationList';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import { getLanguage, getTranslations } from '../../util/languageUtils';
import Loading from '../Loading/Loading';
import CurationItem from './CurationItem';
import SkeletonCuration from './SkeletonCuration';

const CurationsList = ({ userId }) => {
  const language = getLanguage();
  const { user: translations } = getTranslations(language);

  const lastElementRef = useRef(null);

  const { curationList, getNextData, isLoading, hasMore } = useGetCurationList(userId);

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  if (isLoading && curationList === 0) return <Loading />;

  if (!curationList || curationList.length === 0) {
    return <EmptyMessage>{translations.noCurations}</EmptyMessage>;
  }

  return (
    <>
      <GridContainer>
        {curationList.map((curation, index) => (
          <CurationItem
            key={index}
            item={curation}
            ref={index === curationList.length - 1 ? lastElementRef : null}
          />
        ))}
      </GridContainer>
      {/* {isLoading && <LoadingMessage>Loading...</LoadingMessage>} */}
      {/* ✅ 무한 스크롤로 데이터 불러올 때 스켈레톤 UI 표시 */}
      {isLoading &&
        Array(2)
          .fill(0)
          .map((_, index) => <SkeletonCuration key={index} />)}
    </>
  );
};

export default CurationsList;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2열 그리드 */
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 8rem;
`;

const EmptyMessage = styled.p`
  text-align: center;
  width: 100%;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.Gray2};
  box-sizing: border-box;
`;
