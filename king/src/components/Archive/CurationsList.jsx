import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getBookmarkStatus, removeBookmark } from '../../lib/bookmark';
import CurationItem from './CurationItem';
const CurationsList = ({ data }) => {
  // BE 연결 후 테스트 필요
  // const [curationsList, setCurationsList] = useState(data); // 북마크된 리스트 관리

  // useEffect(() => {
  //   // ✅ 북마크 상태 불러와서 업데이트
  //   const fetchBookmarks = async () => {
  //     const updatedList = await Promise.all(
  //       data.map(async (item) => {
  //         const isBookmarked = await getBookmarkStatus(item.id);
  //         return { ...item, bookmarked: isBookmarked };
  //       }),
  //     );
  //     setCurationsList(updatedList);
  //   };

  //   fetchBookmarks();
  // }, [data]);

  // // ✅ 북마크 해제 후 리스트에서 제거
  // const handleRemoveBookmark = async (id) => {
  //   const success = await removeBookmark(id);
  //   if (success) {
  //     setCurationsList((prev) => prev.filter((item) => item.id !== id)); // 해당 아이템 제거
  //   }
  // };

  return (
    <StCurationList>
      {data.map((item) => (
        <CurationItem key={item.id} item={item} />
      ))}
    </StCurationList>

    // BE 연결 후 테스트 필요
    // <StCurationList>
    //   {curationsList.map((item) => (
    //     <CurationItem key={item.id} item={item} onRemoveBookmark={handleRemoveBookmark} />
    //   ))}
    // </StCurationList>
  );
};

export default CurationsList;

const StCurationList = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.1rem;
  width: 100%;
  overflow-y: auto;

  /* 스크롤바를 보이지 않게 설정 */
  &::-webkit-scrollbar {
    display: none; /* 크롬, 사파리 등 Webkit 기반 브라우저 */
  }

  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE, Edge */
`;
