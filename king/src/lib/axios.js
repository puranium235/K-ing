import axios from 'axios';

import { tokenRefresh } from './auth';

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const client = axios.create({
  baseURL,
  headers: {
    'Content-type': 'application/json',
  },
  withCredentials: true, // 쿠키를 포함하여 요청 (refreshToken 자동 전송)
});

// ✅ 요청 인터셉터: 모든 요청에 `accessToken` 자동 추가
client.interceptors.request.use(
  async (config) => {
    // let accessToken = localStorage.getItem('accessToken');
    let accessToken = import.meta.env.VITE_MASTER_ACCESS_TOKEN;

    // 토큰 재발급 요청(`/user/token-refresh`)은 제외
    if (!config.url.includes('/user/token-refresh') && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ✅ 응답 인터셉터: accessToken이 만료되면 자동 재발급
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('🔄 AccessToken 만료: 재발급 시도');
      const newAccessToken = await tokenRefresh();

      if (newAccessToken) {
        // ✅ 새로운 accessToken으로 요청 재시도
        error.config.headers.Authorization = `Bearer ${newAccessToken}`;
        return client(error.config);
      }
    }

    return Promise.reject(error);
  },
);
