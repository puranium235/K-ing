import { jwtDecode } from 'jwt-decode';
import { Navigate, Outlet } from 'react-router-dom';

// ✅ 토큰에서 유저 역할 가져오기
const getUserRole = () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return null;

  try {
    const decoded = jwtDecode(accessToken);
    return decoded.role;
  } catch (error) {
    console.error('❌ 토큰 디코딩 실패:', error);
    return null;
  }
};

const ProtectedRoute = () => {
  const userRole = getUserRole();

  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== 'ROLE_REGISTERED') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
