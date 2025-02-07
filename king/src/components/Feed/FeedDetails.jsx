import React, { useState } from 'react';
import styled from 'styled-components';

const FeedDetails = () => {
  return (
    <>
      <StFeedWrapper>
        <FixedContainer>
          <IconText>
            <BackButton onBack={handleGoBack} />
            <p> Post</p>
          </IconText>
          <SearchBar type={contentType.toUpperCase()} query="" onSearch={handleSearch} />
        </FixedContainer>
      </StFeedWrapper>
    </>
  );
};

export default FeedDetails;

const StFeedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  margin-bottom: 7rem;
`;

const FixedContainer = styled.div`
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.White};
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.7rem;

  svg {
    width: 1.8rem;
    height: 1.8rem;
  }

  p {
    width: 100%;
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
  }
`;
