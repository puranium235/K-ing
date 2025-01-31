// 📌 auth.js (회원가입 및 닉네임 중복 검사 + 토큰 재발급)
import { client } from './axios';

// ✅ 닉네임 중복 검사 API
export const checkNickname = async (nickname) => {
  try {
    const res = await client.get(`/user/nickname?nickname=${nickname}`);
    return { success: res.data.success, message: '' }; // 닉네임 사용 가능
  } catch (err) {
    console.error('닉네임 중복 검사 실패:', err);

    // 닉네임이 중복된 경우 (409 상태 코드)
    if (err.response?.status === 409) {
      return { success: false, message: '중복된 닉네임입니다.' };
    }

    // 서버 오류 또는 다른 예외 처리
    return { success: false, message: '서버 오류가 발생했습니다. 다시 시도해주세요.' };
  }
};

// ✅ 회원가입 API (AccessToken 저장 및 에러 처리 포함)
export const postSignup = async (nickname, language) => {
  try {
    const res = await client.post('/user/signup', { nickname, language });

    // ✅ 서버가 응답 헤더에 AccessToken을 포함하면 저장
    const accessToken = res.headers.authorization?.split(' ')[1];
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }

    return { success: true, message: '' };
  } catch (err) {
    console.error('회원가입 요청 실패:', err);

    if (err.response) {
      const { code } = err.response.data;
      let errorMessage = '회원가입에 실패했습니다. 다시 시도해주세요.';

      if (code === 'INVALID_NICKNAME') {
        errorMessage = '유효하지 않은 닉네임입니다.';
      } else if (code === 'INVALID_LANGUAGE') {
        errorMessage = '유효하지 않은 언어코드입니다.';
      } else if (code === 'DUPLICATED_NICKNAME') {
        errorMessage = '중복된 닉네임입니다.';
      }

      return { success: false, message: errorMessage };
    }

    return { success: false, message: '서버 오류가 발생했습니다. 다시 시도해주세요.' };
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
