import React from "react";
import styled from "styled-components";

import Home from "../components/Home/Home";

const FeedPage = () => {
  return (
    <>
      <Home />
    </>
  );
};

export default FeedPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
