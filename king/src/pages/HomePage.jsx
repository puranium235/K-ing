import React from "react";
import styled from "styled-components";

import Button from "../components/common/Button";
import Nav from "../components/Home/Nav";

const HomePage = () => {
  return (
    <>
      <Nav />
      <Button />
      <St.Wrapper>K-ing</St.Wrapper>
    </>
  );
};

export default HomePage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title3};
  `,
};
