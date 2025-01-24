import React, { useState } from 'react';
import styled from 'styled-components';

import DummyData from '../../assets/dummy/dummyData';
import CloseButton from '../common/CloseButton';
import Nav from '../common/Nav';
import FilterButtons from './FilterButtons';
import GoogleMapView from './GoogleMapView';
import ListItem from './ListItem';

const MapCurationPlaces = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);

  const filters = ['식당', '카페', '관광', '상점', '숙박'];

  const filterToTypeMap = {
    식당: 'restaurant',
    카페: 'cafe',
    관광: 'playground',
    상점: 'store',
    숙박: 'stay',
  };

  const toggleBox = () => {
    setIsExpanded(!isExpanded);
  };

  const handleFilterChange = (filter) => {
    setActiveFilter((prevFilter) => (prevFilter === filter ? null : filter));
  };

  // 필터링된 장소 데이터
  const filteredPlaces = activeFilter
    ? DummyData.filter((place) => place.type === filterToTypeMap[activeFilter])
    : DummyData;

  return (
    <Container>
      {/* Map Section */}
      <MapSection>
        <GoogleMapView places={filteredPlaces} />
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
          {filteredPlaces.map((place) => (
            <ListItem key={place.placeId} {...place} />
          ))}
        </ListContainer>
      </ContentSection>

      <CloseButton />
      <Nav />
    </Container>
  );
};

const Container = styled.div`
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
  ${(props) => (props.$isExpanded ? 'top: 90px;' : 'top: calc(100vh - 400px);')}
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

export default MapCurationPlaces;
