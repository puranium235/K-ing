import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import DummyData from '../../assets/dummy/dummyMapPlace';
import UpIcon from '../../assets/icons/up.png';
import { searchMapView } from '../../lib/map';
import { FilterOption, searchQueryState, searchRegionState } from '../../recoil/atom';
import CloseButton from '../common/CloseButton';
import Nav from '../common/Nav';
import FilterButtons from './FilterButtons';
import GoogleMapView from './GoogleMapView';
import ListItem from './ListItem';

const MapSearchPlaces = () => {
  const query = useRecoilValue(searchQueryState);
  const region = useRecoilValue(searchRegionState);
  const [filterOption, setFilterOption] = useRecoilState(FilterOption);

  const [isExpanded, setIsExpanded] = useState(false);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const filters = ['RESTAURANT', 'CAFE', 'PLAYGROUND', 'STORE', 'STAY'];

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const data = await searchMapView(query, region);
        setPlaces(data);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [query, region]);

  const toggleBox = () => {
    setIsExpanded(!isExpanded);
  };

  const handleFilterChange = (filter) => {
    setFilterOption((prevOption) => {
      const updatedCategories = {
        ...prevOption.categories,
        [filter]: !prevOption.categories[filter],
      };

      // 모든 필터가 false이면 전체 해제 상태로 유지
      const allFalse = Object.values(updatedCategories).every((value) => !value);

      return {
        ...prevOption,
        categories: allFalse ? { ...updatedCategories } : updatedCategories,
      };
    });

    console.log(filterOption.categories);
  };

  const filteredPlaces = places.filter((place) => {
    if (Object.values(filterOption.categories).every((value) => !value)) return true;
    return filterOption.categories[place.type];
  });

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      {/* Map Section */}
      <MapSection>
        <GoogleMapView places={filteredPlaces} isSearch={true} />
      </MapSection>

      {/* Content Section */}
      <ContentSection $isExpanded={isExpanded}>
        <UpButton onClick={toggleBox}>
          <img src={UpIcon} />
        </UpButton>

        <FilterContainer>
          <FilterButtons
            filters={filters}
            activeFilter={filterOption.categories}
            onFilterChange={handleFilterChange}
          />
        </FilterContainer>
        {filteredPlaces.length > 0 ? (
          <ListContainer>
            {filteredPlaces.map((place) => (
              <ListItem key={place.id} place={place} />
            ))}
          </ListContainer>
        ) : (
          <NoResultsContainer>
            <NoResultsText>검색 결과가 없습니다.</NoResultsText>
          </NoResultsContainer>
        )}
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

const UpButton = styled.button`
  border: none;
  margin: 10px auto;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  img {
    width: 60px;
    height: 20px;
  }
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

const NoResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 200px;
`;

const NoResultsText = styled.p`
  ${({ theme }) => theme.fonts.Body3};
  color: #888;
`;

export default MapSearchPlaces;
