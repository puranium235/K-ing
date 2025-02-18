export const splitIntoMessages = (message, sender, selectedBot) => {
  const emojiRegex = /[\p{Emoji_Presentation}\u200D\u2600-\u2B55]/gu;
  const isEmojiOnly = (text) => emojiRegex.test(text) && text.replace(emojiRegex, '').trim() === '';

  // ✅ `[]` 안의 내용 삭제
  //message = message.replace(/\[.*?\]/g, '').trim();

  const messages = [];
  const maxLength = selectedBot?.includes('T') ? 50 : 100; // ✅ 너무 짧거나 길지 않도록 적절한 기준

  let currentMessage = '';

  message.split(/(?<=[.!?])\s+|\n+/g).forEach((sentence) => {
    if (!sentence.trim()) return; // ✅ 빈 문자열 필터링
    if (currentMessage.length + sentence.length > maxLength) {
      messages.push({ text: currentMessage.trim(), sender, type: 'message' });
      currentMessage = sentence;
    } else {
      currentMessage += (currentMessage ? ' ' : '') + sentence;
    }
  });

  if (currentMessage.trim()) {
    messages.push({ text: currentMessage.trim(), sender, type: 'message' });
  }

  return messages;
};
