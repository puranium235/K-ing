import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// 주소를 "서울시 마포구"까지만 추출
const getShortAddress = (fullAddress) => {
  const parts = fullAddress.split(" "); // 공백을 기준으로 나누기
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`; // 첫 번째와 두 번째 부분만 반환
  }
  return fullAddress; // 주소가 짧거나 비정상적인 경우 원본 반환
};

const ListItem = ({ placeId, name, type, address, openHours, closedDays, placeImage }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/place/${placeId}`); // 상세 페이지로 이동
  };

  const isAlwaysOpen = closedDays === "연중무휴"; // 연중무휴 여부 확인

  return (
    <ItemContainer onClick={handleClick}>
      <TitleRow>
        <Title>{name}</Title>
        <Desc>{type}</Desc>
      </TitleRow>
      <InfoRow>
        {closedDays && (
          <ImportantInfoItem $isAlwaysOpen={isAlwaysOpen}>
            <img
              src={
                isAlwaysOpen
                  ? "src/assets/icons/good.png" // 연중무휴 아이콘
                  : "src/assets/icons/bad.png" // 기본 휴무 아이콘
              }
              alt={isAlwaysOpen ? "Always Open" : "Closed"}
            />
            {closedDays}
          </ImportantInfoItem>
        )}
        {address && (
          <InfoItem>
            <img src="src/assets/icons/location.png" alt="Location" />
            {getShortAddress(address)}
          </InfoItem>
        )}
        {openHours && (
          <InfoItem>
            <img src="src/assets/icons/clock.png" alt="Open Hours" />
            {openHours}
          </InfoItem>
        )}
      </InfoRow>
      {placeImage && <Image src={placeImage} alt={name} />}
    </ItemContainer>
  );
};

const ItemContainer = styled.div`
  padding: 25px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 14px;
  cursor: pointer;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 4px;
`;

const Title = styled.h2`
  margin: 0;
  font: ${(theme) => theme.fonts.Title5};
`;

const Desc = styled.p`
  font: ${(theme) => theme.fonts.Body5};
  color: rgba(37, 37, 37, 0.7);
`;

const InfoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 4px 0px;
`;

const InfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font: ${(theme) => theme.fonts.Body5};
  color: rgba(37, 37, 37, 0.7);

  img {
    width: 16px;
    height: 16px;
  }
`;

const ImportantInfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font: ${(theme) => theme.fonts.Body2};
  color: ${(props, theme) =>
    props.$isAlwaysOpen ? "#17A600" : theme.colors.Red}; /* 연중무휴일 때 색상 변경 */

  img {
    width: 16px;
    height: 16px;
  }
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 8px;
`;

export default ListItem;
