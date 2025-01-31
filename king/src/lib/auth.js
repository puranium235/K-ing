// 📌 auth.js (회원가입 및 닉네임 중복 검사 + 토큰 재발급)
import { client } from './axios';

// ✅ 닉네임 중복 검사 API
export const checkNickname = async (nickname) => {
  try {
    const res = await client.get('/user/nickname', { params: { nickname } });
    return res.data.success;
  } catch (err) {
    if (err.response?.status === 409) {
      return false; // 중복된 닉네임
    }
    console.error('닉네임 중복 검사 실패:', err);
    return false;
  }
};

// ✅ 회원가입 API (AccessToken 저장)
export const postSignup = async (nickname, language) => {
  try {
    const res = await client.post('/user/signup', { nickname, language });

    // ✅ 서버가 응답 헤더에 AccessToken을 포함하면 저장
    const accessToken = res.headers.authorization?.split(' ')[1];
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken); // 저장
    }

    return res;
  } catch (err) {
    console.error('회원가입 요청 실패:', err);
    throw err;
  }
};

// ✅ 토큰 재발급 API
export const tokenRefresh = async () => {
  try {
    const res = await client.post(
      '/user/token-refresh',
      {},
      {
        withCredentials: true, // 쿠키를 포함하여 요청 (refreshToken 자동 포함)
      },
    );

    // ✅ 새 accessToken을 로컬 스토리지에 저장
    const newAccessToken = res.headers.authorization?.split(' ')[1];
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
    }

    return newAccessToken;
  } catch (err) {
    console.error('토큰 재발급 실패:', err);

    // ❌ 토큰이 유효하지 않거나 만료되었을 경우 -> 로그인 페이지로 이동
    if (err.response?.status === 401) {
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      localStorage.removeItem('accessToken'); // 기존 accessToken 삭제
      window.location.href = '/'; // 로그인 페이지로 리디렉트
    }

    return null;
  }
};
