import React from 'react';
import styled from 'styled-components';

import CurationItem from './CurationItem';

const CurationsList = ({ data }) => {
  return (
    <St.List>
      {data.map((item) => (
        <CurationItem key={item.id} item={item} />
      ))}
    </St.List>
  );
};

export default CurationsList;

const St = {
  List: styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.1rem;
    width: 100%;
    overflow-y: auto;
  `,
};
