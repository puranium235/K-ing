import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';

import useGetPlaceSearchResult from '../../hooks/search/useGetPlaceSearchResult';
import { CurationPlaceUploadList } from '../../recoil/atom';
import { catchLastScrollItem } from '../../util/catchLastScrollItem';
import SearchBar from '../common/SearchBar';

const CurationPlaceSearch = () => {
  const navigate = useNavigate();
  const lastElementRef = useRef(null);

  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [CurationPlaceList, setCurationPlaceList] = useRecoilState(CurationPlaceUploadList);

  const { placeList, getNextData, isLoading, hasMore } = useGetPlaceSearchResult({
    query: searchQuery,
    category: 'PLACE',
  });

  useEffect(() => {
    if (CurationPlaceList.length > 0) {
      setSelectedPlaces(
        CurationPlaceList.map((place) => ({
          id: place.placeId,
          name: place.name,
          imageUrl: place.imageUrl,
        })),
      );
    }
  }, [CurationPlaceList]);

  useEffect(() => {
    catchLastScrollItem(isLoading, lastElementRef, getNextData, hasMore);
  }, [isLoading]);

  const handleOptionClick = (option) => {
    setSearchQuery(option.name);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePlaceChange = (item) => {
    setSelectedPlaces((prevPlaces) => {
      const index = prevPlaces.findIndex((place) => place.id === item.id);
      if (index < 0) {
        return [...prevPlaces, item];
      }

      prevPlaces;
    });
  };

  const handleRemovePlace = (id) => {
    setSelectedPlaces(selectedPlaces.filter((place) => place.id !== id));
  };

  const handleComplete = () => {
    setCurationPlaceList(
      selectedPlaces.map((place) => ({
        placeId: place.id,
        name: place.name,
        imageUrl: place.imageUrl,
      })),
    );
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
            <PlaceItem key={place.id}>
              <img src={place.imageUrl} alt="선택한 장소" />
              <p>{place.name}</p>
              <button onClick={() => handleRemovePlace(place.id)}>X</button>
            </PlaceItem>
          ))}
        </SelectedPlaces>
        <SearchPlaceWrapper>
          <SearchBar
            type={'PLACE'}
            query={searchQuery}
            onSet={handleOptionClick}
            onSearch={handleSearch}
          />
          {placeList.map((place, index) => (
            <ShowItem
              key={place.placeId}
              ref={index === placeList.length - 1 ? lastElementRef : null}
            >
              <img src={place.imageUrl} alt="장소" />
              <p>{place.name}</p>
              <input
                type="checkbox"
                checked={selectedPlaces.some((p) => p.id === place.id)}
                onChange={(event) => handlePlaceChange(place, event)}
              />
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
    width: 3rem;
    height: 3rem;
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
