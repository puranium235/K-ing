import React, { useRef, useState } from "react";
import styled from "styled-components";

import sampleImage from "../assets/dummy/curationimg.png";
import ArchiveHeader from "../components/Archive/ArchiveHeader";
import ArchiveTabMenu from "../components/Archive/ArchiveTabMenu";
import CurationsList from "../components/Archive/CurationsList";

const ArchivePage = () => {
  const [activeTab, setActiveTab] = useState("Curations");

  const [curationsData, setCurationsData] = useState([
    {
      id: 1,
      image: sampleImage,
      author: "k-ing_Official",
      title: "최애의 흔적을 찾아서 : BTS의 RM편",
      bookmarked: true,
    },
    {
      id: 2,
      image: sampleImage,
      author: "hsmoon101",
      title: "바닷가 근처 드라마 촬영지.zip",
      bookmarked: true,
    },
    {
      id: 3,
      image: sampleImage,
      author: "hsmoon101",
      title: "바닷가 근처 드라마 촬영지.zip",
      bookmarked: true,
    },
    {
      id: 4,
      image: sampleImage,
      author: "hsmoon101",
      title: "바닷가 근처 드라마 촬영지.zip",
      bookmarked: true,
    },
    {
      id: 5,
      image: sampleImage,
      author: "hsmoon101",
      title: "바닷가 근처 드라마 촬영지.zip",
      bookmarked: true,
    },
    {
      id: 6,
      image: sampleImage,
      author: "hsmoon101",
      title: "바닷가 근처 드라마 촬영지.zip",
      bookmarked: true,
    },
  ]);

  return (
    <>
      <St.Page>
        <St.Header>
          <St.Header>Archive</St.Header>
        </St.Header>
        <ArchiveTabMenu onTabChange={tab => setActiveTab(tab)} />
        {activeTab === "Curations" && <CurationsList data={curationsData} />}
        {activeTab === "Favorites" && <div>Favorites 화면 준비 중...</div>}
      </St.Page>
    </>
  );
};

export default ArchivePage;

const St = {
  Page: styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh; /* 전체 화면 높이 */
  `,
  Header: styled.header`
    position: sticky; /* 스크롤 시 상단에 고정 */
    top: 0;
    background-color: ${({ theme }) => theme.colors.White};
    z-index: 10; /* 콘텐츠 위로 올림 */
    padding: 10px;
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
  `,
};
