const config = require('../config');
const internalError = "Something went wrong :(";

module.exports = {
  nimHandler: (bot, axios) => (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    var resp = '';

    axios.get(`${config.STUDENT_SERVICE_URL}/?q=${match[1]}`)
    .then((res) => {
      if (res.status == 204) {
        resp = "nothing found";
      } else {
        res.data.data.forEach(student => {
          const {
            nama,
            nim_tpb,
            nim_jur,
            unit_organisasi,
            email_std,
            email_real,
          } = student;
          resp += resp += `${nama} ${nim_tpb} ${nim_jur} ${unit_organisasi}\n`;
        });
      }
      // if (res.data.count > 10 || res.data.count === 0) {
      //   resp += `\nto show more use /nim -a [query]`;
      // }
      bot.sendMessage(chatId, resp, { 
        reply_to_message_id: messageId 
      });
    })
    .catch((err) => {
      console.error(err)
      bot.sendMessage(chatId, internalError, { 
        reply_to_message_id: messageId 
      });
    });
  }
}