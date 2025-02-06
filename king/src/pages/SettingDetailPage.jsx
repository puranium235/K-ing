import styled from 'styled-components';

import Setting from '../components/Setting/Setting';

const SettingDetailPage = () => {
  return (
    <StSettingDetailPageWrapper>
      <Setting />
    </StSettingDetailPageWrapper>
  );
};

export default SettingDetailPage;

const StSettingDetailPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;
