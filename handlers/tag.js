const request = require('request');
const bl = require('bl');

const {
  S3_ENDPOINT,
  S3_BUCKET
} = require('../config');
const s3 = require('../config/s3');
const TagModel = require('../models/tags');

const internalError = "Something went wrong :(";

module.exports = {
  tagHandler: (bot) => async (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const tagName = match[1];

    try {
      const tag = await TagModel.findOne({
        tag_name: tagName,
        is_public: false,
        tag_room: chatId, 
      });

      if (tag == null) {
        return bot.sendMessage(chatId, `tag '${tagName}' not found :(`, {
          reply_to_message_id: messageId,
        });
      }

      bot.sendPhoto(chatId, tag.tag_url, {
        reply_to_message_id: messageId,
      });

    } catch (error) {
      bot.sendMessage(chatId, internalError, {
        reply_to_message_id: messageId,
      })
    }
  },

  hashTagHandler: (bot) => async (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const tagName = match[0].replace(/#/g, "");

    const replyToId = msg.reply_to_message && 
      msg.reply_to_message.message_id ?
        msg.reply_to_message.message_id :
        messageId;

    try {
      const tag = await TagModel.findOne({
        tag_name: tagName,
        is_public: false,
        tag_room: chatId,
      });
      
      if (tag == null) {
        return bot.sendMessage(chatId, `tag '${tagName}' not found :(`, {
          reply_to_message_id: messageId,
        });
      }

      bot.sendPhoto(chatId, tag.tag_url, {
        reply_to_message_id: replyToId,
      })
    } catch (error) {
      console.log(error);
      bot.sendMessage(chatId, internalError, {
        reply_to_message_id: replyToId,
      });
    }
  },

  dollarTagHandler: (bot) => async (msg, match) => {
    console.log('dollar tag handler');
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const tagName = match[0].replace(/\$/g, '');

    const replyToId = msg.reply_to_message && 
      msg.reply_to_message.message_id ?
        msg.reply_to_message.message_id :
        messageId;
  

    try {
      const tag = await TagModel.findOne({
        tag_name: tagName,
        is_public: true,
      });

      if (tag == null) {
        return bot.sendMessage(chatId, `tag '${tagName}' not found :(`, {
          reply_to_message_id: messageId,
        });
      }

      bot.sendPhoto(chatId, tag.tag_url, {
        reply_to_message_id: replyToId,
      })
    } catch (error) {
      console.log(error);
      bot.sendMessage(chatId, internalError, {
        reply_to_message_id: replyToId,
      });
    }
  },

  addTagHandler: (bot) => async (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const query = match[1].split(" ");
    const tagName = query[0];
    const tagOwner = msg.from;
    const link = query[1];
  
    if (tagName && link) {
      try {
        const isExist = await TagModel.exists({
          tag_name: tagName,
          tag_room: chatId,
        });

        if (isExist) {
          return bot.sendMessage(
            chatId, 
            `tag '${tagName}' already exist in this room`, 
            {
              reply_to_message_id: messageId,
            }
          );
        }

        await TagModel.create({
          tag_name: tagName,
          tag_url: link,
          tag_room: chatId,
          tag_owner: tagOwner,
          created_at: Date.now(),
        });

        bot.sendMessage(chatId, `tag '${tagName}' created as a private tag`);
      } catch (err) {
        console.log(err);
        bot.sendMessage(chatId, internalError, {
          reply_to_message_id: messageId,
        });
      }
    } else {
      bot.sendMessage(chatId, "Usage: /addtag [tag_name] [link]", { 
        reply_to_message_id: messageId 
      });
    }
  },

  addTagFHandler: (bot, tags) => async (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const ownerId = msg.from.id;

    const query = match[1].split(" ");
    const tagName = query[0];

    let isExist = await TagModel.exists({
      tag_name: tagName,
      tag_room: chatId,
    });

    if (!isExist) {
      isExist = Object.values(tags).find(tag => tag == tagName);
    }

    if (isExist) {
      return bot.sendMessage(
        chatId, 
        `tag '${tagName}' already exist in this room`, 
        {
          reply_to_message_id: messageId,
        }
      )
    }

    tags[ownerId] = tagName;

    bot.sendMessage(chatId, "now upload your image", {
      reply_to_message_id: messageId
    });
  },

  uploadTagFileHandler: (bot, tags) => async (msg) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const tagOwner = msg.from;

    if (tags[tagOwner.id] == null) return;
    
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

    const fileName = `${Date.now()}-${tags[tagOwner.id]}.${ext}`;

    const req = request(link);
    req.pause();

    req.on('response', res => {
      if (res.statusCode !== 200) {
        return bot.sendMessage(chatId, "something went wrong", {
          reply_to_message_id: messageId
        });
      }

      req.pipe(
        bl((err, data) => {
          const params = {
            ContentType: mimeType,
            Bucket: S3_BUCKET,
            Body: data,
            Key: fileName,
            ACL: 'public-read',
          }
          s3.putObject(params, (s3err, dat) => {
            if (s3err) {
              console.log(s3err);
              bot.sendMessage(chatId, internalError, {
                reply_to_message_id: messageId,
              });
            } else {
              console.log(dat);
            }
          })
        })
      )
      .on('error', err => {
        console.log(err)
        bot.sendMessage(chatId, "something went wrong", {
          reply_to_message_id: messageId
        });
      })
      .on('finish', async () => {
        const tagLink = `https://${S3_BUCKET}.${S3_ENDPOINT}/${fileName}`;
        const result = await TagModel.create({
          tag_name: tags[tagOwner.id],
          tag_url: tagLink,
          tag_owner: tagOwner,
          tag_room: chatId,
          created_at: Date.now()
        });

        if (result) {
          bot.sendMessage(chatId, `tag ${tags[tagOwner.id]} created`, {
            reply_to_message_id: messageId,
          });
        } else {
          bot.sendMessage(chatId, internalError, {
            reply_to_message_id: messageId,
          })
        }
      })
    });

    req.resume();
  },

  tagListHandler: (bot) => async (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    
    let resp = "";
  
    try {
      const tags = await TagModel.find(
        {
          $or: [
            { is_public: true },
            { tag_room: chatId }
          ]
        },
        {
          _id: 0,
          is_public: 1,
          tag_name: 1,
        }
      );
  
      const publicTags = tags
        .filter(tag => tag.is_public)
        .map(tag => tag.tag_name)
        .join(', ');
      const privateTags = tags
        .filter(tag => !tag.is_public)
        .map(tag => tag.tag_name)
        .join(', ');
  
      resp = `public: ${publicTags}\ngroup: ${privateTags}`;
  
      bot.sendMessage(chatId, resp, {
        reply_to_message_id: messageId,
      });
    } catch (error) {
      bot.sendMessage(chatId, internalError, {
        reply_to_message_id: messageId,
      });
    }
  },

  deleteTagHandler: (bot) => async (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const tagName = match[1];
  
    if (!match[1]) {
      bot.sendMessage(chatId, "Usage: /deletetag [tag_name]", { 
        reply_to_message_id: messageId 
      });
    } else {
      try {
        await TagModel.findOneAndDelete({
          tag_name: tagName,
          is_public: false,
          tag_room: chatId,
        });

        bot.sendMessage(chatId, `tag '${tagName}' deleted`, {
          reply_to_message_id: messageId,
        });
      } catch (error) {
        bot.sendMessage(chatId, internalError, {
          reply_to_message_id: messageId,
        })
      }
    }
  },

  tagOwnerHandler: (bot) => async (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const tagName = match[1];
  
    if(tagName) {
      try {
        const tag = await TagModel.findOne(
          {
            tag_name: tagName,
            is_public: false,
            tag_room: chatId,
          },
          {
            _id: 0,
            tag_owner: 1,
          }
        );
  
        if (tag == null) {
          bot.sendMessage(chatId, `tag '${tagName}' not found :(`, {
            reply_to_message_id: messageId,
          });
        } else {
          bot.sendMessage(
            chatId, 
            `tag '${tagName}' was created by ${tag.tag_owner.username}`, {
              reply_to_message_id: messageId,
            }
          );
        }
      } catch (error) {
        bot.sendMessage(chatId, internalError, {
          reply_to_message_id: messageId,
        })
      }
    } else {
      bot.sendMessage(chatId, "Usage /tagowner [tag_name]", { 
        reply_to_message_id: messageId 
      });
    }
  },
}