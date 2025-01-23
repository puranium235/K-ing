import React from 'react';
import styled from 'styled-components';

const FilterButton = ({ buttonName, buttonIcon: Icon, onClickMethod }) => {
  //   const { buttonName, buttonIcon, onClickMethod } = btnInfo;

  return (
    <>
      <ButtonWrapper onClick={onClickMethod}>
        {Icon && <Icon />}
        {buttonName}
      </ButtonWrapper>
    </>
  );
};
export default FilterButton;

const ButtonWrapper = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  border: 1px solid ${({ theme }) => theme.colors.Gray2};
  padding: 0.7rem 1rem;
  width: fit-content;

  border-radius: 10px;
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.MainBlue : theme.colors.Gray0};
`;
