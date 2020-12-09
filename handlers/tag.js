const config = require('../config');
const internalError = "Something went wrong :(";

module.exports = {
  tagHandler: (bot, dbConn) => (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const tag_name = match[1];
  
    if (tag_name) {
      dbConn.query("SELECT * FROM tags WHERE tag_name = ?", tag_name, 
        (err, results, field) => {
          if (err) {
            bot.sendMessage(chatId, internalError);
          } else if (results.length) {
            bot.sendPhoto(chatId, results[0].link);
            
          } else {
            bot.sendMessage(chatId,`tag '${tag_name}' not found :(`, { 
              reply_to_message_id: messageId 
            });
          }
      });
    } else {
      bot.sendMessage(chatId, "Usage: /tag [tag_name]", { 
        reply_to_message_id: messageId 
      });
    }
  },

  hashTagHandler: (bot, dbConn) => (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const tag_name = match[0].replace(/#/g, "");

    const replyToId = msg.reply_to_message && 
      msg.reply_to_message.message_id ?
        msg.reply_to_message.message_id :
        messageId;
  
    dbConn.query("SELECT * FROM tags WHERE tag_name = ?", tag_name,
    (err, results, field) => {
      if (err) {
        bot.sendMessage(chatId, internalError, { 
          reply_to_message_id: messageId 
        });
      } else if (results.length) {
        bot.sendPhoto(chatId, results[0].link, { 
          reply_to_message_id: replyToId
        });
      } else {
        bot.sendMessage(chatId, `tag ${tag_name} not found :(`, { 
          reply_to_message_id: messageId 
        });
      }
    });
  },

  addTagHandler: (bot, dbConn) => (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const query = match[1].split(" ");
    const tag_name = query[0];
    const tag_owner = msg.from.username;
    const link = query[1];
  
    if (tag_name && link) {
      dbConn.query("INSERT INTO tags (tag_name, link, tag_owner) VALUES (?, ?, ?)", [tag_name, link, tag_owner],
        (err, results, field) => {
          if (err) {
            console.log(err)
            bot.sendMessage(chatId, internalError);
          } else {
            bot.sendMessage(chatId, `tag '${tag_name}' created`);
          }
        });
    } else {
      bot.sendMessage(chatId, "Usage: /addtag [tag_name] [link]", { 
        reply_to_message_id: messageId 
      });
    }
  },

  addTagFHandler: (bot, tags) => (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const ownerId = msg.from.id;

    const query = match[1].split(" ");
    const tagName = query[0];

    tags[ownerId] = tagName;

    bot.sendMessage(chatId, "now upload your image", {
      reply_to_message_id: messageId
    });
  },

  uploadTagFileHandler: (bot, tags, bucket, dbConn) => async (msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const ownerId = msg.from.id;

    if (tags[ownerId] == null) return;
    
    bot.sendMessage(chatId, "nice pic dude", {
      reply_to_message_id: messageId
    });

    const link = await bot.getFileLink(msg.photo[msg.photo.length - 1].file_id);
    const ext = link.split(".").pop();
    let mimeType = '';
    
    switch (ext) {
      case 'png':
        mimeType = 'image/png';
        break;
      case 'jpg':
        mimeType = 'image/jpeg';
        break;
      case 'jpeg':
        mimeType = 'image/jpeg';
        break;
      default:
        break;
    }

    const fileName = `${Date.now()}-${tags[ownerId]}.${ext}`;

    const file = bucket.file(fileName);

    const req = request(link);
    req.pause();

    req.on('response', res => {
      if (res.statusCode !== 200) {
        bot.sendMessage(chatId, "something went wrong", {
          reply_to_message_id: messageId
        });
      }

      req.pipe(
        file.createWriteStream({
          resumable: false,
          public: true,
          metadata: {
            contentType: mimeType
          }
        })
      )
      .on('error', err => {
        console.log(err)
        bot.sendMessage(chatId, "something went wrong", {
          reply_to_message_id: messageId
        });
      })
      .on('finish', () => {
        file.makePublic();
        
        const tagLink = `https://storage.googleapis.com/${process.env.GC_BUCKET}/${fileName}`;
        // bot.sendMessage(chatId, `https://storage.googleapis.com/${process.env.GC_BUCKET}/${fileName}`, {
        //   reply_to_message_id: messageId
        // });
        dbConn.query("INSERT INTO tags (tag_name, link, tag_owner) VALUES (?, ?, ?)", 
          [tags[ownerId], tagLink, ownerId],
          (err, results, field) => {
            if (err) {
              console.log(err)
              bot.sendMessage(chatId, internalError, {
                reply_to_message_id: messageId
              });
            } else {
              bot.sendMessage(chatId, `tag '${tag_name}' created`, {
                reply_to_message_id: messageId
              });
            }
          });
          
        delete tags[ownerId];
        // bot.sendPhoto(chatId, `https://storage.googleapis.com/${process.env.GC_BUCKET}/${fileName}`, {
        //   reply_to_message_id: messageId
        // })
      })

    });

    req.resume();

  },

  tagListHandler: (bot, dbConn) => (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    var resp = "";
  
    dbConn.query("SELECT * FROM tags", (err, results, field) => {
      if (err) {
        bot.sendMessage(chatId, internalError, { 
          reply_to_message_id: messageId 
        });
      } else {
        results.forEach(r => {
          resp += `${r.tag_name},`
        })
        resp = resp.replace(/,$/, "");
  
        bot.sendMessage(chatId, resp, { 
          reply_to_message_id: messageId 
        });
      }
    });
  },

  deleteTagHandler: (bot, dbConn) => (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
  
    if (!match[1]) {
      bot.sendMessage(chatId, "Usage: /deletetag [tag_name]", { 
        reply_to_message_id: messageId 
      });
    } else {
      dbConn.query("DELETE FROM tags WHERE tag_name = ?", match[1],
        (err, results, field) => {
          if (err) {
            bot.sendMessage(chatId, internalError, { 
              reply_to_message_id: messageId 
            });
          } else {
            bot.sendMessage(chatId, `tag '${match[1]}' deleted`, { 
              reply_to_message_id: messageId 
            });
          }
        }
        );
    }
  },

  tagOwnerHandler: (bot, dbConn) => (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const tag_name = match[1];
  
    if(tag_name) {
      dbConn.query("SELECT * FROM tags WHERE tag_name = ?", tag_name,
        (err, results, field) => {
          if (err) {
            bot.sendMessage(chatId, internalError, { 
              reply_to_message_id: messageId 
            });
          } else if (results.length) {
            bot.sendMessage(chatId, `tag ${tag_name} was created by ${results[0].tag_owner}`, { 
              reply_to_message_id: messageId 
            });
          } else {
            bot.sendMessage(chatId, `tag ${tag_name} not found :(`, { 
              reply_to_message_id: messageId 
            });
          }
        });
    } else {
      bot.sendMessage(chatId, "Usage /tagowner [tag_name]", { 
        reply_to_message_id: messageId 
      });
    }
  },
}