const internalError = "Something went wrong :("

module.exports = {
  rHandler: (bot, snoo) => (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const messageId = msg.message_id;
    var subreddit;
    var flag;
    var amount;
    
    var args = match[1].split(" ");
    subreddit = args[0];
    flag = args[1];
    amount = parseInt(args[2]) || 1;
    // special treatment for the birthday boy
    // if (userId == BANNEDUSERID) {
    // 	subreddit = 'fiftyfifty';
    // }
    if (subreddit) {
      var posts = [];
      snoo.getSubreddit(subreddit)
      .getHot({limit: 100})
      .then(res => {
        res.forEach(post => {
          posts.push({
            text: post.title,
            link: post.url,
            is_video: post.is_video,
            media: post.media,
            desc: post.selftext,
            link_flair_text: post.link_flair_text,
            comments: post.comments
          })
        })
        let postIdx = Math.floor(Math.random()*100);
        // bot.sendMessage(chatId, posts[postIdx].text);
        if (posts[postIdx].is_video === true) { // check if the post if a gif
          bot.sendVideo(chatId, posts[postIdx].media.reddit_video.fallback_url, { 
            reply_to_message_id: messageId,
            caption: posts[postIdx].text
          });
        } else {
          if (posts[postIdx].media === null) { // check if the post is a static image
            bot.sendPhoto(chatId, posts[postIdx].link, { 
              reply_to_message_id: messageId,
              caption: posts[postIdx].text
            });
          } else { // send a video post
            let vid_url = posts[postIdx].media.oembed.html.match(/src=".*" frame/)[0]
            .replace(`src="`, '')
            .replace(`" frame`, '')
            bot.sendVideo(chatId, vid_url, { 
              reply_to_message_id: messageId, 
              caption: posts[postIdx].text
            });
          }
        }
  
        if (flag == "-c" || flag == "--comments") {
          posts[postIdx].comments.fetchMore({
            amount: amount,
            sort: 'top'
          })
          .then(ext => {
            ext.forEach(com => {
              bot.sendMessage(chatId, `>> ${com.body}`);
            })
          })
        } else if (flag == '-d') {
          bot.sendMessage(chatId, `>> ${posts[postIdx].desc}`);
        } else if (flag == "-lf") {
          bot.sendMessage(chatId, posts[postIdx].link_flair_text);
        }
      })
      .catch(err => {
        console.log(err);
        bot.sendMessage(chatId, internalError);
      })
    } else {
      bot.sendMessage(chatId, "Usage /r [subreddit_name]");
    }
  },

  randomHandler: (bot, snoo) => (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    var posts = [];
    snoo.getSubreddit("dankmemes")
    .getTop({time: "day", limit:100})
    .then(res => {
      res.forEach(post => {
        posts.push({
          text: post.title,
          link: post.url,
          is_video: post.is_video
        })
      })
      let postIdx = Math.floor(Math.random()*100);
      // bot.sendMessage(chatId, posts[postIdx].text);
      bot.sendPhoto(chatId, posts[postIdx].link, { 
        reply_to_message_id: messageId,
        caption: posts[postIdx].text
      });
    })
    .catch(err => {
      console.log(err);
      bot.sendMessage(chatId, internalError, { 
        reply_to_message_id: messageId 
      });
    })    
  },

  askRedditHandler: (bot, snoo) => async (msg, match) => {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;
    const subreddit = "askreddit";
    var posts = [];
  
    snoo.getSubreddit(subreddit)
    .getHot({limit: 100})
    .then( async (res) => {
      res.forEach(post => {
        posts.push({
          question : post.title,
          comments: post.comments
        })
      })
      let postIdx = Math.floor(Math.random()*100);
      
      const question = await bot.sendMessage(chatId, `**${posts[postIdx].question}**`, { 
        reply_to_message_id: messageId,
        parse_mode: 'Markdown'
      });
      posts[postIdx].comments.fetchMore({
        amount:2,
        sort: 'top'
      })
      .then(ext => {
        ext.forEach(com => {
          bot.sendMessage(chatId, `>> ${com.body}`, { 
            reply_to_message_id: question.message_id
          });
        })
      })
    })
    .catch(err => {
      console.log(err);
      bot.sendMessage(chatId, internalError);
    })
  },
}