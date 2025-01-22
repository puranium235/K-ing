import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { IcBack } from '../../assets/icons';

const BackButton = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <>
      <BtnWrapper onClick={handleGoBack}>
        <IcBack />
      </BtnWrapper>
    </>
  );
};

export default BackButton;

const BtnWrapper = styled.button``;
