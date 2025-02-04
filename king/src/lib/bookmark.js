import { client } from './axios';

// ✅ 북마크 상태 확인 (GET)
export const getBookmarkStatus = async (id) => {
  try {
    const response = await client.get(`/curation/${id}/bookmark`);
    return response.data.bookmarked; // `{ bookmarked: true/false }`
  } catch (error) {
    console.error(`❌ 북마크 상태 조회 실패: ${id}`, error);
    return false; // 기본값 false 반환
  }
};

// ✅ 북마크 해제 (DELETE)
export const removeBookmark = async (id) => {
  try {
    await client.delete(`/curation/${id}/bookmark`);
    return true; // 성공하면 true 반환
  } catch (error) {
    console.error(`❌ 북마크 해제 실패: ${id}`, error);
    return false;
  }
};
