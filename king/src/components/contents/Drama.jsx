import React from "react";
import styled from "styled-components";

import Nav from "../common/Nav";
import SearchBar from "../common/SearchBar";

const Drama = () => {
  const dramas = [
    {
      id: 1,
      title: "도깨비",
      image: "/src/assets/dummy/poster1.png",
    },
    {
      id: 2,
      title: "도깨비",
      image: "/src/assets/dummy/poster1.png",
    },
    {
      id: 3,
      title: "도깨비",
      image: "/src/assets/dummy/poster1.png",
    },
  ];

  return (
    <>
      <StHomeWrapper>
        <h3>{"<"} 드라마</h3>
        <SearchBar />
        <GridContainer>
          {dramas.map((drama) => (
            <Card key={drama.id}>
              <CardImageContainer>
                <CardImage src={drama.image} alt={drama.title} />
                <Stars>⭐</Stars>
              </CardImageContainer>
              <CardTitle>{drama.title}</CardTitle>
            </Card>
          ))}
        </GridContainer>
        <Nav />
      </StHomeWrapper>
    </>
  );
};

export default Drama;

const StHomeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  padding: 2rem;
  margin-bottom: 7rem;

  h3 {
    width: 100%;
    padding: 1rem 2rem;
    text-align: left;
    ${({ theme }) => theme.fonts.Title3};
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 10px;
`;

const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.White};
  position: relative;
`;

const CardImageContainer = styled.div`
  width: 100%;
  position: relative;
`;

const CardImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
`;

const CardTitle = styled.h4`
  margin-top: 5px;
  ${({ theme }) => theme.fonts.Body4};
  color: ${({ theme }) => theme.colors.Gray0};
`;

const Stars = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  color: #ffc107;
`;
