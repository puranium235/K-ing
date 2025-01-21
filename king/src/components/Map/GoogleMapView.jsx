import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import styled from "styled-components";
import dummyData from "../../assets/dummy/dummyData";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_MAP_ID = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
const libraries = ["marker"];

const containerStyle = {
  width: "100%",
  height: "100%",
};

// 맵 옵션 설정
const mapOptions = {
  disableDefaultUI: true,
  clickableIcons: false,
  mapId: GOOGLE_MAPS_MAP_ID,
};

// 마커 타입별 이미지 경로
const markerImages = {
  cafe: "src/assets/marker/cafe-marker.png",
  playground: "src/assets/marker/playground-marker.png",
  restaurant: "src/assets/marker/restaurant-marker.png",
  station: "src/assets/marker/station-marker.png",
  stay: "src/assets/marker/stay-marker.png",
  store: "src/assets/marker/store-marker.png",
};

const GoogleMapView = () => {
  const [center, setCenter] = useState({ lat: 37.5665, lng: 126.978 });
  const [mapInstance, setMapInstance] = useState(null);

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
            markerElement.content = document.createElement("div");
            markerElement.content.style.cssText = `
                background-color: #007bff;
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 14px;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              `;
            markerElement.content.innerText = "현재 위치";

            mapInstance.panTo(newCenter); // 지도 중심 이동
          }
        },
        (error) => {
          console.error("Error fetching location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // 장소 마커 기준
  useEffect(() => {
    if (mapInstance && dummyData.length > 0) {
      // 지도 경계 (bounds) 객체 생성
      const bounds = new google.maps.LatLngBounds();

      dummyData.forEach((marker) => {
        // 마커 추가
        const markerElement = new google.maps.marker.AdvancedMarkerElement({
          position: { lat: marker.lat, lng: marker.lng },
          map: mapInstance,
        });

        // 커스텀 마커 HTML
        const container = document.createElement("div");
        container.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        `;

        // 마커 이미지
        const image = document.createElement("img");
        image.src = markerImages[marker.type] || markerImages["store"]; // 타입별 이미지
        image.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%; /* 원형으로 설정 */
          object-fit: cover; /* 이미지의 왜곡 방지 */
          border: none; /* 테두리 제거 */
          background-color: transparent; /* 배경색 제거 */
        `;

        // 마커 라벨
        const label = document.createElement("div");
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

        // 마커 위치를 bounds에 추가
        bounds.extend({ lat: marker.lat, lng: marker.lng });
      });

      // 지도 중심과 줌 조정
      mapInstance.fitBounds(bounds, { top: 50, bottom: 50, left: 24, right: 24 });
    }
  }, [mapInstance]);

  return (
    <>
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries} version="beta">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center || { lat: 37.5665, lng: 126.978 }} // center가 null일 경우 기본값 사용
          zoom={14}
          options={mapOptions}
          onLoad={(map) => setMapInstance(map)} // 지도 로드 후 인스턴스 저장
        />
      </LoadScript>

      {/* 플로팅 버튼 */}
      <HereButton onClick={moveToCurrentLocation}>
        <img src="src/assets/icons/here.png" alt="here" />
      </HereButton>
    </>
  );
};

// 플로팅 버튼 스타일
const HereButton = styled.button`
  position: fixed;
  bottom: 380px;
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
  font-size: 24px;
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

export default GoogleMapView;
