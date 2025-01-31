import React from 'react';
import styled from 'styled-components';

const ContentsInfo = ({ info }) => {
  return (
    <InfoContainer>
      <InfoRow>
        <InfoTitle>{info.title}</InfoTitle>
        <InfoType>{info.type}</InfoType>
      </InfoRow>
      <Description>{info.description}</Description>
    </InfoContainer>
  );
};

const InfoContainer = styled.div`
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const InfoTitle = styled.h2`
  ${({ theme }) => theme.fonts.Title5};
  margin: 0;
`;

const InfoType = styled.span`
  color: #949494;
  ${({ theme }) => theme.fonts.Body3};
`;

const Description = styled.p`
  ${({ theme }) => theme.fonts.Body2};
  color: #555;
  margin: 5px 0;
`;

export default ContentsInfo;
