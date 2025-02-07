import React from 'react';
import styled from 'styled-components';

import { IcDelete } from '../../assets/icons';

const Comment = () => {
  return (
    <CommentWrapper>
      <UserInfo>
        <UserProfile>
          <Profile src="/src/assets/icons/king_logo.png" alt="default" />
          <p>babo_is_back</p>
        </UserProfile>
        <DateWrapper>14h</DateWrapper>
      </UserInfo>

      <Caption>
        <p>우와 멋져요~~</p>
        <IcDelete />
      </Caption>
      <hr />
    </CommentWrapper>
  );
};

export default Comment;

const CommentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: start;

  gap: 0.5rem;

  width: 100%;
`;
const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  gap: 1rem;
`;
const UserProfile = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;

  gap: 1rem;

  width: 100%;

  p {
    ${({ theme }) => theme.fonts.Title6};
    color: ${({ theme }) => theme.colors.Gray1};
  }
`;
const Profile = styled.img`
  width: 3rem;
`;
const DateWrapper = styled.div`
  ${({ theme }) => theme.fonts.Body6};
  color: ${({ theme }) => theme.colors.Gray2};
`;
const Caption = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  box-sizing: border-box;
  padding: 0 4rem;

  width: 100%;
  p {
    ${({ theme }) => theme.fonts.Body4};
    color: ${({ theme }) => theme.colors.Gray1};
  }
`;
