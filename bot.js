require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const mysql = require('mysql');
const snoowrap = require('snoowrap');
const { Storage } = require('@google-cloud/storage');

const config = require('./config');
const handler = require('./handlers');

const bot = new TelegramBot(process.env.TBTOKEN, {polling: true});

const dbConn = new mysql.createConnection({
	host: config.DB_HOST,
	user: config.DB_USER,
	password: config.DB_PWD,
	database: config.DB_NAME
});
dbConn.connect();

const storage = new Storage({
  projectId: config.GC_PROJECT_ID,
  keyFilename: config.GC_KEY
});

const tagBucket = storage.bucket(config.GC_BUCKET);

const snoo = new snoowrap({
		userAgent : "fatt",
		clientId : config.REDDIT_CLIENT_ID,
		clientSecret : config.REDDIT_CLIENT_SECRET,
		refreshToken : config.REDDIT_REFRESH_TOKEN
});

const tags = {};

bot.onText(/\/help/, handler.helpHandler(bot));
bot.onText(/\/fuck (.*)/, handler.fuckHandler(bot));
bot.onText(/\/echo (.*)/, handler.echoHandler(bot));
bot.onText(/\/whoami/, handler.whoamiHandler(bot));
bot.onText(/\/nim (.*)/, handler.nimHandler(bot, axios));
bot.onText(/\/cheat (.*)/, handler.cheatHandler(bot, axios));
bot.onText(/\/short (.*)/, handler.shortHandler(bot, axios));

bot.onText(/\/showevent (.*)/, handler.showEventHandler(bot, dbConn));
bot.onText(/\/addevent (.*)/, handler.addEventHandler(bot, dbConn));

bot.onText(/\/tag (.*)/, handler.tagHandler(bot, dbConn));
bot.onText(/#([^#])+#/, handler.hashTagHandler(bot, dbConn));
bot.onText(/\/tagowner (.*)/, handler.tagOwnerHandler(bot, dbConn));
bot.onText(/\/addtag (.*)/, handler.addTagHandler(bot, dbConn));
bot.onText(/\/addtagf (.*)/, handler.addTagFHandler(bot, tags));
bot.onText(/\/deletetag (.*)/, handler.deleteTagHandler(bot, dbConn));
bot.onText(/\/taglist/, handler.tagListHandler(bot, dbConn));

bot.onText(/\/random/, handler.randomHandler(bot, snoo));
bot.onText(/\/r (.*)/, handler.rHandler(bot, snoo));
bot.onText(/\/ask/, handler.askRedditHandler(bot, snoo));

bot.onText(/{([^{}])+}/, handler.vvSaysHandler(bot));
bot.onText(/<([^<>])+>/, handler.febySaysHandler(bot));

// tag file upload handler
bot.on('photo', handler.uploadTagFileHandler(bot, tags, tagBucket, dbConn));
// inline query handler
bot.on('inline_query', async (query) => {
	// const inlineResults = [];

	// const res = axios.get()
	bot.answerInlineQuery(query.id, ['a', 'b', query.query]);
});
