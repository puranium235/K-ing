import React, { useState } from "react";
import styled from "styled-components";

const ArchiveTabMenu = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState("Curations");

  const handleTabClick = tab => {
    console.log(`Tab clicked: ${tab}`); // 클릭 확인
    setActiveTab(tab);
    onTabChange(tab);

    if (tab === "Curations") {
      const scrollableElement = document.querySelector(".scrollable-container");
      if (scrollableElement) {
        console.log("Scrolling to top"); // 스크롤 확인
        scrollableElement.scrollTo({
          top: 0,
          behavior: "smooth", // 부드러운 스크롤
        });
      }
    }
  };

  const tabs = ["Curations", "Favorites"];
  const activeIndex = tabs.indexOf(activeTab);

  return (
    <St.TabMenu>
      {tabs.map((tab, index) => (
        <St.TabButton
          key={tab}
          isActive={activeTab === tab} // 활성화 상태 전달
          onClick={() => handleTabClick(tab)}
        >
          {tab}
        </St.TabButton>
      ))}
      <St.Slider activeIndex={activeIndex} />
    </St.TabMenu>
  );
};

export default ArchiveTabMenu;

const St = {
  TabMenu: styled.nav`
    position: relative;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid ${({ theme }) => theme.colors.Gray2};
  `,
  TabButton: styled.button.withConfig({
    shouldForwardProp: prop => prop !== "isActive", // isActive를 DOM에 전달하지 않음
  })`
    flex: 1;
    padding: 8px 0;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 18px;
    text-align: center;

    /* 활성화 상태에 따른 스타일 */
    font-weight: ${({ isActive }) => (isActive ? "bold" : "normal")};
    color: ${({ theme, isActive }) =>
      isActive ? theme.colors.Gray0 : theme.colors.Gray3};
  `,
  Slider: styled.div.withConfig({
    shouldForwardProp: prop => prop !== "activeIndex", // activeIndex를 DOM에 전달하지 않음
  })`
    position: absolute;
    bottom: 0;
    height: 2px;
    width: 50%; /* 각 탭의 너비 */
    background-color: ${({ theme }) => theme.colors.Gray0};
    transition: transform 0.3s ease;
    transform: translateX(${({ activeIndex }) => activeIndex * 100}%);
  `,
};
