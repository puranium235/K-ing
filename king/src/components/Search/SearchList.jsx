import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import SearchItem from './SearchItem';

const SearchList = ({ title, data, type }) => {
  const navigate = useNavigate();

  const unit = title === '인물' ? '명' : '개';

  return (
    <St.Section>
      <St.Header>
        <St.Left>
          <St.Title>{title}</St.Title>
          <St.Count>
            {data.length}
            {unit}의 {title}
          </St.Count>
        </St.Left>
      </St.Header>
      <St.List>
        {data.length > 0 ? (
          <>
            {data.map((item) => (
              <SearchItem key={item.id} item={item} type={type} />
            ))}
          </>
        ) : (
          <St.NoDataMessage>검색 결과가 없습니다. 🥲</St.NoDataMessage>
        )}
      </St.List>
    </St.Section>
  );
};

export default SearchList;

const St = {
  Section: styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;

    padding: 1rem 0.5rem;
  `,
  Header: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  Left: styled.div`
    display: flex;
    align-items: baseline;
    gap: 8px;
    align-items: center;
  `,
  NoDataMessage: styled.div`
    ${({ theme }) => theme.fonts.Body5};
    color: ${({ theme }) => theme.colors.Gray2};
    text-align: center;
    padding: 16px 0;
  `,
  Title: styled.h2`
    ${({ theme }) => theme.fonts.Title6};
  `,
  Count: styled.span`
    ${({ theme }) => theme.fonts.Body6};
    color: ${({ theme }) => theme.colors.Gray2};
  `,
  List: styled.div`
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;

    width: 100%;
    overflow-x: auto;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
};
