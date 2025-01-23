import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
const libraries = ['marker', 'geometry'];

const containerStyle = {
  width: '100%',
  height: '100%',
};

// 맵 옵션 설정
const mapOptions = {
  disableDefaultUI: true,
  clickableIcons: false,
  mapId: GOOGLE_MAPS_MAP_ID,
};

// 마커 타입별 이미지 경로
const markerImages = {
  cafe: 'src/assets/marker/cafe-marker.png',
  playground: 'src/assets/marker/playground-marker.png',
  restaurant: 'src/assets/marker/restaurant-marker.png',
  station: 'src/assets/marker/station-marker.png',
  stay: 'src/assets/marker/stay-marker.png',
  store: 'src/assets/marker/store-marker.png',
};

const GoogleMapView = ({ places }) => {
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [showSearchButton, setShowSearchButton] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleIdle = () => {
    if (!isMapInitialized) {
      setIsMapInitialized(true); // 초기화 완료 설정
      return;
    }

    // 지도 이동 후 검색 버튼 표시
    setShowSearchButton(true);
  };

  const handleSearch = () => {
    if (!mapInstance) return;

    const center = mapInstance.getCenter();
    const bounds = mapInstance.getBounds();

    const radius =
      google.maps.geometry.spherical.computeDistanceBetween(
        bounds.getNorthEast(),
        bounds.getSouthWest(),
      ) / 2;

    const latlng = { lat: center.lat(), lng: center.lng() };
    console.log('검색 중심 좌표:', latlng);
    console.log('검색 반지름 (미터):', radius);

    setShowSearchButton(false); // 버튼 숨기기
  };

  // 현재 위치로 지도 이동 함수
  const moveToCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newCenter = { lat: latitude, lng: longitude };

          setCenter(newCenter); // 중심 업데이트

          if (mapInstance) {
            const markerElement = new google.maps.marker.AdvancedMarkerElement({
              position: { lat: latitude, lng: longitude },
              map: mapInstance,
            });

            // HTML 커스텀 마커
            markerElement.content = document.createElement('div');
            markerElement.content.style.cssText = `
                background-color: #007bff;
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 14px;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              `;
            markerElement.content.innerText = '현재 위치';

            mapInstance.panTo(newCenter); // 지도 중심 이동
          }
        },
        (error) => {
          console.error('Error fetching location:', error);
        },
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  // 지도와 마커 업데이트
  useEffect(() => {
    if (mapInstance && places.length > 0) {
      // 이전 마커 제거
      markers.forEach((marker) => marker.setMap(null));
      setMarkers([]);

      // 새 마커 추가
      const bounds = new google.maps.LatLngBounds();

      const newMarkers = places.map((marker) => {
        const markerElement = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: marker.lat, lng: marker.lng },
          map: mapInstance,
        });

        // 커스텀 마커 HTML
        const container = document.createElement('div');
        container.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        `;

        // 마커 이미지
        const image = document.createElement('img');
        image.src = markerImages[marker.type] || markerImages['store']; // 타입별 이미지
        image.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%;
          object-fit: cover;
          border: none;
          background-color: transparent;
        `;

        // 마커 라벨
        const label = document.createElement('div');
        label.style.cssText = `
          font-size: 12px;
          color: black;
          background-color: white;
          padding: 2px 6px;
          border-radius: 4px;
        `;
        label.innerText = marker.name;

        container.appendChild(image);
        container.appendChild(label);

        markerElement.content = container;

        // 위치를 bounds에 추가
        bounds.extend({ lat: marker.lat, lng: marker.lng });

        return markerElement;
      });

      // 새 마커 상태 업데이트
      setMarkers(newMarkers);

      if (places.length === 1) {
        // 마커가 1개일 때: 중심 설정 및 줌 레벨 조정
        const singleMarker = places[0];
        mapInstance.setCenter({ lat: singleMarker.lat, lng: singleMarker.lng });
        mapInstance.setZoom(15); // 원하는 줌 레벨
      } else {
        // 여러 마커가 있을 때: fitBounds로 지도 맞춤
        mapInstance.fitBounds(bounds, { top: 50, bottom: 50, left: 24, right: 24 });
      }
    }
  }, [mapInstance, places]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  return (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center || { lat: 37.5665, lng: 126.978 }}
        zoom={14}
        options={mapOptions}
        onLoad={(map) => setMapInstance(map)}
        onIdle={handleIdle} // 지도 이동 후 이벤트
      />

      {/* 현재 위치 버튼 */}
      <HereButton onClick={moveToCurrentLocation}>
        <img src="src/assets/icons/here.png" alt="here" />
      </HereButton>

      {/* 이 지역에서 다시 검색 */}
      {showSearchButton && (
        <SearchButton onClick={handleSearch}>
          <img src="src/assets/icons/refresh.png" alt="here" />이 지역에서 검색
        </SearchButton>
      )}
    </>
  );
};

const HereButton = styled.button`
  position: absolute;
  bottom: 40px;
  right: 20px;
  background-color: #fff;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 1000;

  &:hover {
    background-color: #ccc;
  }

  img {
    width: 15px;
    height: 15px;
    object-fit: contain; /* 이미지가 왜곡되지 않도록 설정 */
  }
`;

const SearchButton = styled.button`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #ffffff;
  ${({ theme }) => theme.fonts.Body3};
  border: none;
  border-radius: 20px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #f0f0f0;
  }

  img {
    width: 15px;
    height: 15px;
    object-fit: contain; /* 이미지가 왜곡되지 않도록 설정 */
  }
`;

export default GoogleMapView;
