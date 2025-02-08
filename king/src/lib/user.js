import { client } from './axios';

export const getUserProfile = async (userId) => {
  try {
    const response = await client.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('❌ 프로필 데이터를 불러오는 중 오류 발생:', error);
    throw error;
  }
};
