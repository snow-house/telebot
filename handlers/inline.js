const axios = require('axios');
const config = require('../config');

module.exports = {
  inlineHandler: (bot) => async (msg) => {
    if (msg.query.trim().length > 2) {
      const query = encodeURIComponent(msg.query.trim());

      const students = await axios
        .get(`${config.STUDENT_SERVICE_URL}/?q=${query}`);

      const resultList = students.data.data.map((student, idx) => (
        {
          type: 'article',
          id: idx,
          title: student.nama,
          description: student.unit_organisasi,
          input_message_content: {
            parse_mode: 'HTML',
            message_text: 
              `<b>${student.nama}</b>\n\n
              ${student.unit_organisasi}\n
              ${student.nim_tpb}\n
              ${student.nim_jur}
              `
          }
        }
      ));

      bot.answerInlineQuery(msg.id, resultList);
    }
  },
}