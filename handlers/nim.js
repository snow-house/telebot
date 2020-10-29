const internalError = "Something went wrong :(";

module.exports = {
  nimHandler: (bot, axios) => (msg, match) => {
    const { ARYUUU_API_URL } = require('../config');
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    var resp = '';

    axios.get(`${ARYUUU_API_URL}/get/nim/${match[1]}`)
    .then((res) => {
      if (res.status == 204) {
        resp = "nothing found";
      } else {
        for (let i = 0; i < 10 && i < res.data.count; i++) {
          let data = res.data.data[i];
          let nama = data.nama;
          let jurusan = data.jurusan;
          let fakultas = data.fakultas;
          let tpb = data.tpb;
          let s1 = data.s1;

          resp += `${nama} ${tpb} ${s1 !='NULL'?s1:''} ${fakultas} ${jurusan}\n`
        }
      }
      if (res.data.count > 10 || res.data.count === 0) {
        resp += `\nto show more use /nim -a [query]`;
      }
      bot.sendMessage(chatId, resp, { 
        reply_to_message_id: messageId 
      });
    })
    .catch((err) => {
      bot.sendMessage(chatId, internalError, { 
        reply_to_message_id: messageId 
      });
    });
  }
}