// FE : works, people / BE : content, cast 매칭 시키는 함수

export const convertType = (frontendType) => {
  const typeMap = {
    works: 'content',
    people: 'cast',
  };
  return typeMap[frontendType] || frontendType; // 변환이 없으면 원래 값 그대로 반환
};
