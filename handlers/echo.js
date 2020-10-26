module.exports = (bot) => (msg, match) => {
  const chatId = msg.chat.id;
  const resp = match[1];
  const messageId = msg.message_id;

  bot.sendMessage(chatId, resp, { 
    reply_to_message_id: messageId 
  });
}