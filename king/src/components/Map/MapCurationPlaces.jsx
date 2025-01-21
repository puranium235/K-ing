import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import dummyData from "../../assets/dummy/dummyData";
import FilterButtons from "./FilterButtons";
import GoogleMapView from "./GoogleMapView";
import ListItem from "./ListItem";

const MapCurationPlaces = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [places, setPlaces] = useState(dummyData);

  const toggleBox = () => {
    setIsExpanded(!isExpanded);
  };

  const filters = ["식당", "카페", "관광", "상점", "숙박"];

  const handleFilterChange = (filter) => {
    setActiveFilter((prevFilter) => (prevFilter === filter ? null : filter));
  };

  const navigate = useNavigate();
  const handleClose = () => {
    navigate(-1);
  };

  return (
    <Container>
      {/* Map Section */}
      <MapSection>
        <GoogleMapView />
      </MapSection>

      {/* Content Section */}
      <ContentSection $isExpanded={isExpanded}>
        <SlideBar onClick={toggleBox} />
        <FilterContainer>
          <FilterButtons
            filters={filters}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
          />
        </FilterContainer>
        <ListContainer>
          {places.map((place) => (
            <ListItem key={place.placeId} {...place} />
          ))}
        </ListContainer>
      </ContentSection>
      <ClosedButton onClick={handleClose}>
        <img src="src/assets/icons/close.png" alt="close" />
      </ClosedButton>
    </Container>
  );
};

const Container = styled.div`
  font-family: Arial, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MapSection = styled.div`
  position: relative;
  height: calc(100vh - 380px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SlideBar = styled.div`
  width: 60px;
  height: 3px;
  background-color: #cbcbcb;
  border-radius: 2.5px;
  margin: 10px auto;
  margin-bottom: 20px;
  cursor: pointer;
`;

const FilterContainer = styled.div`
  padding: 1px 20px;
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContentSection = styled.div`
  background-color: #ffffff;
  height: 100%;
  position: absolute;
  ${(props) => (props.$isExpanded ? "top: 90px;" : "top: calc(100vh - 400px);")}
  left: 0;
  right: 0;
  transition: bottom 0.3s ease;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  z-index: 1001;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
  background-color: #f2f2f2;

  & > div:first-child {
    padding: 25px;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 0px 0px 14px 14px;
  }
`;

const ClosedButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  background-color: #fff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 1000;

  &:hover {
    background-color: #ccc;
  }

  img {
    width: 25px;
    height: 25px;
    object-fit: contain; /* 이미지가 왜곡되지 않도록 설정 */
  }
`;

export default MapCurationPlaces;
