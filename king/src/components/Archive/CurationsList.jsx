import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

// import { getBookmarkStatus, removeBookmark } from '../../lib/bookmark';
import useGetCurationList from '../../hooks/archive/useGetCurationList';
import { getCurations } from '../../lib/bookmark';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import Loading from '../Loading/Loading';
import CurationItem from './CurationItem';

const CurationsList = () => {
  const lastElementRef = useRef(null);

  const { curationList, getNextData, isLoading, hasMore } = useGetCurationList();

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading, hasMore, lastElementRef]);

  if (isLoading && curationList === 0) return <Loading />;

  if (!curationList || curationList.length === 0) {
    return <StNoDataMessage>등록된 큐레이션이 없습니다.</StNoDataMessage>;
  }

  // const [curations, setCurations] = useState([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchCurations = async () => {
  //     setLoading(true);
  //     const curationsData = await getCurations(); // ✅ bookmark.js에서 불러옴
  //     setCurations(curationsData);
  //     setLoading(false);
  //   };

  //   fetchCurations();
  // }, []);

  return (
    <StCurationList>
      {curationList.map((curation, index) => (
        <CurationItem
          key={index}
          item={curation}
          ref={index === curationList.length - 1 ? lastElementRef : null}
        />
      ))}
    </StCurationList>
  );
};

export default CurationsList;

const StCurationList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.1rem;
  width: 100%;
  margin-bottom: 8rem;
  overflow-y: auto;

  /* 스크롤바를 보이지 않게 설정 */
  &::-webkit-scrollbar {
    display: none; /* 크롬, 사파리 등 Webkit 기반 브라우저 */
  }

  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE, Edge */
`;

const StNoDataMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.colors.Gray2};
`;
