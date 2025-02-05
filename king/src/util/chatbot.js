export const splitIntoSentences = (message, sender) => {
  const emojiRegex = /[\p{Emoji_Presentation}\u200D\u2600-\u2B55]/gu; // 이모티콘 감지 정규식
  const isEmojiOnly = (text) => emojiRegex.test(text) && text.replace(emojiRegex, '').trim() === '';

  return message
    .split(/(?<=[.!?])\s+/) // 문장 구분 (온점, 느낌표, 물음표 기준)
    .filter(Boolean) // 빈 값 제거
    .reduce((result, sentence, index) => {
      // 이모티콘만으로 이루어진 경우 처리
      if (isEmojiOnly(sentence)) {
        // 첫 번째 문장이 이모티콘일 경우 병합하지 않고 추가
        if (index === 0 || result.length === 0) {
          result.push({
            text: sentence,
            sender,
            type: 'message',
          });
        } else {
          // 이후 이모티콘은 이전 문장과 병합
          result[result.length - 1].text += ` ${sentence}`;
        }
      } else {
        // 일반 문장인 경우 새 메시지로 추가
        result.push({
          text: sentence,
          sender,
          type: 'message',
        });
      }
      return result;
    }, []);
};
