import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import useGetPlaceSearchResult from '../../hooks/search/useGetPlaceSearchResult';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import SearchBar from '../common/SearchBar';

const CurationPlaceSearch = () => {
  const navigate = useNavigate();
  const lastElementRef = useRef(null);

  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [place, setPlace] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { placeList, getNextData, isLoading, hasMore } = useGetPlaceSearchResult({
    query: searchQuery,
    category: 'PLACE',
  });

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading]);

  const handlePlaceChange = (item) => {
    if (!selectedPlaces.find((place) => place.originalId === item.originalId)) {
      setSelectedPlaces([...selectedPlaces, item]);
    }
    setPlace(item.name);
  };

  const handleRemovePlace = (id) => {
    setSelectedPlaces(selectedPlaces.filter((place) => place.originalId !== id));
  };

  const handleComplete = () => {
    const selectedIds = selectedPlaces.map((place) => place.originalId);
    console.log(selectedIds); // ID 배열 저장하는 로직을 이곳에 구현
    navigate(-1);
  };

  return (
    <>
      <StWrapper>
        <IconText>
          <p onClick={handleComplete}>완료</p>
        </IconText>
        <h3>선택한 장소</h3>
        <SelectedPlaces>
          {selectedPlaces.map((place) => (
            <PlaceItem key={place.originalId}>
              <img src={place.imageUrl} alt="선택한 장소" />
              <p>{place.name}</p>
              <button onClick={() => handleRemovePlace(place.originalId)}>X</button>
            </PlaceItem>
          ))}
        </SelectedPlaces>
        <SearchPlaceWrapper>
          <SearchBar type={'PLACE'} query={place} onSet={handlePlaceChange} />
          {placeList.map((place, index) => (
            <ShowItem
              key={place.placeId}
              ref={index === placeList.length - 1 ? lastElementRef : null}
            >
              <img src={place.imageUrl} alt="선택한 장소" />
              <p>{place.name}</p>
              <input onClick={handlePlaceChange} type="radio"></input>
            </ShowItem>
          ))}
        </SearchPlaceWrapper>
      </StWrapper>
    </>
  );
};

export default CurationPlaceSearch;

const StWrapper = styled.div`
  padding: 2rem;
  h3 {
    margin-top: 3rem;
    margin-bottom: 2rem;
    ${({ theme }) => theme.fonts.Title5};
    color: ${({ theme }) => theme.colors.Gray1};
  }
`;

const IconText = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: center;
  gap: 0.7rem;

  width: 100%;
  box-sizing: border-box;
  padding: 0 1rem;

  p {
    padding: 0.5rem 0;
    text-align: left;
    ${({ theme }) => theme.fonts.Title4};
    cursor: pointer;
  }
`;

const SelectedPlaces = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  min-height: 5rem;
`;

const PlaceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0.5rem 0;

  position: relative;

  img {
    width: 5rem;
    height: 5rem;
    border-radius: 1rem;
    object-fit: cover;
    object-position: center;
  }

  p {
    ${({ theme }) => theme.fonts.Body3};
    color: ${({ theme }) => theme.colors.Gray1};
  }

  button {
    position: absolute;
    right: 0;
    top: 0;

    width: 1.5rem;
    height: 1.5rem;

    border: none;
    text-align: center;
    cursor: pointer;

    background-color: black;
    border-radius: 10rem;
    color: ${({ theme }) => theme.colors.White};
  }
`;
const ShowItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin: 0.5rem 0;

  img {
    width: 5rem;
    height: 5rem;
    border-radius: 1rem;
    object-fit: cover;
    object-position: center;
  }

  p {
    ${({ theme }) => theme.fonts.Body3};
    color: ${({ theme }) => theme.colors.Gray1};
  }

  button {
    width: 2.5rem;
    height: 2.5rem;
    border: none;
    cursor: pointer;

    background-color: black;
    border-radius: 10rem;
    color: ${({ theme }) => theme.colors.White};
  }
`;

const SearchPlaceWrapper = styled.div`
  width: 100%;
`;
