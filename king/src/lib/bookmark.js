import { client } from './axios';

// 북마크한 큐레이션 가져오기
export const getCurations = async () => {
  try {
    const response = await client.get('/curation?bookmarked=true');
    if (response.data.success) {
      return response.data.data.curations;
    }
    return [];
  } catch (error) {
    console.error('큐레이션 데이터를 불러오는 중 오류 발생:', error);
    return [];
  }
};

// 북마크 해제
export const removeBookmark = async (curationId) => {
  try {
    await client.delete('/bookmark', {
      data: { curationId },
    });
    return true; // 성공하면 true 반환
  } catch (error) {
    console.error(`❌ 북마크 해제 실패: ${curationId}`, error);
    return false;
  }
};
