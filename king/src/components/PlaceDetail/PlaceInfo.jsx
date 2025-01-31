import React from 'react';
import styled from 'styled-components';

import BadIcon from '../../assets/icons/bad.png';
import ClockIcon from '../../assets/icons/clock.png';
import GoodIcon from '../../assets/icons/good.png';
import LocationIcon from '../../assets/icons/location.png';
import PenIcon from '../../assets/icons/pen.png';
import PhoneIcon from '../../assets/icons/phone.png';
import { formatDate } from '../../util/dateFormat';

const PlaceInfo = ({ placeData }) => {
  const { closedDay, address, openHour, phone, createdAt } = placeData;
  const isAlwaysOpen = closedDay === '연중무휴';

  return (
    <DetailContainer>
      <ImportantInfoItem $isAlwaysOpen={isAlwaysOpen}>
        <img
          src={isAlwaysOpen ? GoodIcon : BadIcon}
          alt={isAlwaysOpen ? 'Always Open' : 'Closed'}
        />
        {closedDay}
      </ImportantInfoItem>
      <Details>
        <img src={LocationIcon} alt="Location" /> &nbsp; {address}
      </Details>
      {!isAlwaysOpen && (
        <Details>
          <img src={ClockIcon} alt="Clock" /> &nbsp; {closedDay} 휴무
        </Details>
      )}
      <Details>
        <img src={ClockIcon} alt="Clock" /> &nbsp; {openHour}
      </Details>
      <Details>
        <img src={PhoneIcon} alt="Phone" /> &nbsp; {phone}
      </Details>
      <Details>
        <img src={PenIcon} alt="Pen" /> &nbsp; {formatDate(createdAt)}
      </Details>
    </DetailContainer>
  );
};

const DetailContainer = styled.div`
  padding: 20px 0px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;

  img {
    width: 15px;
  }
`;

const Details = styled.div`
  ${({ theme }) => theme.fonts.Body2};
  color: ${({ theme }) => theme.colors.Gray1};
`;

const ImportantInfoItem = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  ${({ theme }) => theme.fonts.Title5};
  color: ${(props) => (props.$isAlwaysOpen ? '#17A600' : props.theme.colors.Red)};

  img {
    width: 16px;
    height: 16px;
  }
`;

export default PlaceInfo;
