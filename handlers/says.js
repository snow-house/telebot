const jimp = require('jimp');

const config = require('../config');

const internalError = "Something went wrong :("

module.exports = {
  vvSaysHandler: (bot) => (msg, match) => {
    const chatId = msg.chat.id;
    const textData = {
      text: match[0].substring(1,match[0].length-1),
      maxWidth: 380,
      maxHeight: 250,
      x: 178,
      y: 465
    };

    jimp.read(config.VV_IMG)
    .then(image => {
      jimp.loadFont(jimp.FONT_SANS_32_BLACK)
      .then(font => {
        image.print(
          font,
          textData.x,
          textData.y,
          {
            text: textData.text,
            alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: jimp.VERTICAL_ALIGN_MIDDLE
          },
          textData.maxWidth,
          textData.maxHeight
        )
        .getBuffer(jimp.MIME_JPEG, (err, buffer) => {
          bot.sendPhoto(chatId, buffer);
        })
        
      })
    })
    .catch(err => {
      console.log(err);
    })
  },

  febySaysHandler: (bot) => (msg, match) => {
    const chatId = msg.chat.id;
    const textData = {
        text: match[0].substring(1,match[0].length-1),
        maxWidth: 380,
        maxHeight: 250,
        x: 178,
        y: 465
    };
  
    jimp.read(config.FB_IMG)
    .then(image => {
        jimp.read(config.BLANK_IMG)
        .then(blank => {
            jimp.loadFont(jimp.FONT_SANS_32_BLACK)
            .then(font => {
                blank.print(
                    font,
                    0,
                    0,
                    {
                      text: textData.text,
                      alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
                      alignmentY: jimp.VERTICAL_ALIGN_MIDDLE
                    },
                    300,
                    220
                )
                .rotate(-6)
                image.composite(blank, 261, 489, [jimp.BLEND_DESTINATION_OVER, 0.2, 0.2])
                .getBuffer(jimp.MIME_JPEG, (err, buffer) => {
                  bot.sendPhoto(chatId, buffer);
                })
            })
        })
    })
    .catch(err => {
      console.log(err);
    })  
  },
}