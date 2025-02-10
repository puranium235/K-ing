import { client } from './axios';

// ✅ 사용자 프로필 정보 가져오기
export const getUserProfile = async (userId) => {
  try {
    const response = await client.get(`/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ 프로필 수정 API (multipart/form-data 적용)
export const updateUserProfile = async (profileData, imageFile) => {
  try {
    const formData = new FormData();

    // 🔹 서버가 요구하는 "user" 키 추가
    const userObject = JSON.stringify(profileData);
    formData.append('user', new Blob([userObject], { type: 'application/json' }));

    // 🔹 프로필 이미지 추가 (파일이 존재하는 경우에만)
    if (imageFile instanceof File) {
      // console.log('이미지 파일 추가 : ', imageFile.name);
      formData.append('imageFile', imageFile);
    } else {
      // console.warn('⚠️ 프로필 이미지가 File 객체가 아닙니다. 전송하지 않습니다.');
    }

    // console.log('📤 업데이트 요청 데이터:', formData);

    const response = await client.patch('/user', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // console.log('✅ 서버 응답:', response.data);

    return response.data;
  } catch (error) {
    // console.error('❌ 프로필 업데이트 중 오류 발생:', error.response?.data || error.message);
    throw error;
  }
};

// 알람 설정 업데이트 API (multipart/form-data 적용)
export const updateNotificationSetting = async (isOn) => {
  try {
    const formData = new FormData();

    // 서버가 요구하는 "user" 키 추가
    const userObject = JSON.stringify({ contentAlarmOn: isOn });
    formData.append('user', new Blob([userObject], { type: 'application/json' }));

    // console.log('📤 알람 설정 변경 요청 데이터:', formData);

    const response = await client.patch('/user', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    // console.error('❌ 알람 설정 업데이트 중 오류 발생:', error.response?.data || error.message);
    throw error;
  }
};
