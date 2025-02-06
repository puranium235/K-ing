import React from 'react';
import styled from 'styled-components';

function MyPage() {
  return <Button onClick={() => window.location.replace('/user/2')}>유저!!</Button>;
}

export default MyPage;

const Button = styled.button`
  position: absolute;
  top: 15px;
  background: none;
  border: solid;
  font-size: 20px;
  cursor: pointer;
`;
