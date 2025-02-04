import styled from 'styled-components';

function SettingsButton({ isMyPage }) {
  if (!isMyPage) return null; // 🔥 내 마이페이지가 아니면 버튼 숨기기

  return <Button onClick={() => window.location.replace('/setting')}>⚙️</Button>;
}

export default SettingsButton;

const Button = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;
