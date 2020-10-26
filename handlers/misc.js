const qs = require('querystring')

const internalError = "Something went wrong :("

module.exports = {
  echoHandler: (bot) => (msg, match) => {
    const chatId = msg.chat.id;
    const resp = match[1];
    const messageId = msg.message_id;

    bot.sendMessage(chatId, resp, { 
      reply_to_message_id: messageId 
    });
  },

  fuckHandler: (bot) => (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    var respList = ['I know right', `yeah, fuck ${match[1]}`, 'damn right']
    const resp = respList[Math.floor(Math.random()*(respList.length))];
  
    bot.sendMessage(chatId, resp, { 
      reply_to_message_id: messageId 
    });
  },

  helpHandler: (bot) => (msg, match) => {
    const chatId = msg.chat.id;
    const resp = `Help
    - /nim [query], itb nim finder
    - /echo [msg], echo.. literally
    - /whoami , shows who you really are
    - /cheat [card] [card] [card] [card] , cheat in 24 solver
    - /tag [tag_name], show tagged image
    - /tagowner [tag_name], get tag_owner
    - /addtag [tag_name] [link], tag an image
    - /taglist, show all tags,
    - /deletetag [tag_name], delete tag
    - /showevent [-p || -g], show events, use flag -p to show your private event and -g for global
    - /addevent [event_name] [event_time], add event
    - /random , get a random meme from r/dankmemes
    - /r [subreddit_name], get a post from a subreddit
    - /short [real_link] [custom_link], short a link with a custom link
    `;
    bot.sendMessage(chatId, resp);
    
  },

  cheatHandler: (bot, axios) => (msg, match) => {
    const { ARYUUU_API_URL } = require('../config');
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    var resp = '';
  
    var nums = match[1].split(' ');
    axios.get(`${ARYUUU_API_URL}/24solver/${nums[0]}/${nums[1]}/${nums[2]}/${nums[3]}`)
    .then((res) => {
      let d = res.data;
      resp += `${d.message}\n`;
      resp += `${d.count === 0?'':d.data[0]}`;
  
      bot.sendMessage(chatId, resp, { 
        reply_to_message_id: messageId 
      });
    })
    .catch((err) => {
      console.log(err)
      bot.sendMessage(chatId, internalError, { 
        reply_to_message_id: messageId 
      });
    })
  },

  whoamiHandler: (bot) => (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const messageId = msg.message_id;
    const username = msg.from.username;
    const firstname = msg.from.first_name;
  
    const resp = `you are user ${userId} @${username} or should i call you ${firstname}`;
  
    bot.sendMessage(chatId, resp, { 
      reply_to_message_id: messageId 
    });
  },

  shortHandler: (bot, axios) => (msg, match) => {
    const chatId = msg.chat.id;
    let resp = '';
    let links = match[1].split(' ');
    let body;
    const url = `http://bmusuko.ninja:3000/short/createLink`
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
      }
    if(links.length == 1 || links.length == 2){
      if(links.length == 1){
        body = {
          real_link: links[0]
        }
      } else if(links.length == 2){
        body ={
          real_link: links[0],
          desired_link: links[1]
        }
      }
      axios.post(url,qs.stringify(body),config)
      .then((response)=>{
        bot.sendMessage(chatId, response.data.data.generated_link);
      })
      .catch((err)=>{
        bot.sendMessage(chatId, internalError);
        console.log(err);
      })
    } else{
      bot.sendMessage(chatId, internalError);
      
    }
  }
}