import React from "react";
import styled from "styled-components";

const ArchiveHeader = () => (
  <StArchiveHeader.Wrapper>Archive</StArchiveHeader.Wrapper>
);

export default ArchiveHeader;

const StArchiveHeader = {
  Wrapper: styled.header`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    ${({ theme }) => theme.fonts.Title4};
    padding: 1em;
  `,
};
