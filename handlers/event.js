const internalError = "Something went wrong :("

module.exports = {
  showEventHandler: (bot, dbConn) => (msg, match) => {
    const chatId = msg.chat.id;
    const event_owner = msg.from.id;
  
    if (match[1].match(/-p/)) {
      dbConn.query("SELECT * FROM event WHERE event_owner = ?", event_owner, 
        (err, results, field) => {
          if (err) {
            bot.sendMessage(chatId, internalError);
          } else if (results.length) {
            var resp = "";
  
            results.forEach(r => {
              resp += `${r.event_name} ${r.event_time}\n`;
            });
            bot.sendMessage(chatId, resp);
          } else {
            bot.sendMessage(chatId, "no events found");
          }
        });
    } else {
      dbConn.query("SELECT * FROM event WHERE event_owner = ?", "PUBLIC",
        (err, results, field) => {
          if (err) {
            bot.sendMessage(chatId, internalError);
          } else if (results.length) {
            console.log(results);
            var resp = "";
            results.forEach(r => {
              resp += `${r.event_name} ${r.event_time}\n`;
            });
            bot.sendMessage(chatId, resp);
          } else {
            bot.sendMessage(chatId, "no events found");
          }
        });
    }    
  },
  addEventHandler: (bot, dbConn) => (msg, match) => {
    const chatId = msg.chat.id;
    const datetimere = /\d{4}(-\d\d){2} \d\d(:\d\d){2}/;
  
    var event_owner = "PUBLIC";
    var event_detail = match[1];
  
    // validate event to be input
    if (match[1].split(" ").length < 3){
      bot.sendMessage(chatId, "Usage: /addevent [event_name] [event_time], use flag -p to make it private");
    } else if (!match[1].match(datetimere)) {	
      bot.sendMessage(chatId, `event_time format 'YYYY-MM-DD HH:MM:SS'`);
    } else {
      // check for private flag
      if (match[1].match(/-p/)) {
        event_owner = msg.from.id;
        event_detail = event_detail.replace(/-p/,"").trim()
      }
      // get event name and time
      var event_name = event_detail.replace(datetimere, "").trim();
      var event_time = event_detail.match(datetimere)[0];
  
      dbConn.query("INSERT INTO event (event_name, event_time, event_owner) VALUES (?, ?, ?)", [event_name, event_time, event_owner],
        (err, results, field) => {
          if (err) {
            console.log(err)
            bot.sendMessage(chatId, internalError);
          } else {
            bot.sendMessage(chatId, `event '${event_name}' successfully added`);
          }
        });
    }
  },

}