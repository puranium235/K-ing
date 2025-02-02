import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import SearchItem from './SearchItem';

const SearchList = ({ title, data }) => {
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
              <SearchItem key={item.id} item={item} type={title === '작품' ? 'works' : 'people'} />
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
    gap: 16px;

    /* margin-bottom: 2rem; */
    padding: 16px;
  `,
  Header: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  Left: styled.div`
    display: flex;
    align-items: baseline; /* 제목과 카운트를 정렬 */
    gap: 8px; /* 제목과 카운트 간격 */
    align-items: center; /* 메시지 수직 정렬 */
  `,
  NoDataMessage: styled.div`
    ${({ theme }) => theme.fonts.Body5};
    color: ${({ theme }) => theme.colors.Gray2};
    text-align: center;
    width: 100%;
    padding: 16px 0;
  `,
  Title: styled.h2`
    ${({ theme }) => theme.fonts.Body3};
    font-weight: bold;
  `,
  Count: styled.span`
    ${({ theme }) => theme.fonts.Body6};
    color: ${({ theme }) => theme.colors.Gray2};
  `,
  List: styled.div`
    display: flex;
    overflow-x: auto;
    gap: 8px;

    width: 100%;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
};
