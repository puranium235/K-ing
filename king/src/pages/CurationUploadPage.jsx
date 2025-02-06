import React from 'react';
import styled from 'styled-components';

const CurationUploadPage = () => {
  return <>큐레이션 업로드 페이지</>;
};

export default CurationUploadPage;

const St = {
  Wrapper: styled.article`
    background-color: ${({ theme }) => theme.colors.White};
    color: ${({ theme }) => theme.colors.Gray0};
    // ${({ theme }) => theme.fonts.Title3};
  `,
};
