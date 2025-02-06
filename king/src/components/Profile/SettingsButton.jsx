import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const SettingsButton = ({ isMyPage }) => {
  const navigate = useNavigate();

  if (!isMyPage) return null;

  const handleSettingClick = () => {
    navigate(`/setting`);
  };
  return <Button onClick={handleSettingClick}>⚙️</Button>;
};

export default SettingsButton;

const Button = styled.button`
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
`;
