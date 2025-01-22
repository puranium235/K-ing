import React from "react";
import styled from "styled-components";

import CurationItem from "./CurationItem";

const CurationsList = ({ data }) => {
  return (
    <St.List>
      {data.map(item => (
        <CurationItem key={item.id} item={item} />
      ))}
    </St.List>
  );
};

export default CurationsList;

const St = {
  List: styled.div`
    display: grid;
    grid-template-columns: repeat(
      auto-fill,
      minmax(150px, 1fr)
    ); /* 반응형 그리드 */
    gap: 0px; /* 카드 간 간격 */
    padding: 0px; /* 리스트의 패딩 */
    overflow-y: auto; /* 세로 스크롤 활성화 */
    height: calc(
      100vh - 120px
    ); /* 화면 전체 높이에서 헤더와 탭 메뉴를 뺀 영역 */
  `,
};
