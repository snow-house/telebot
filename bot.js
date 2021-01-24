require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const mongoose = require('mongoose');
// const mysql = require('mysql');
// const snoowrap = require('snoowrap');
// const { Storage } = require('@google-cloud/storage');
// const S3 = require('aws-sdk/clients/s3');

const config = require('./config');
const handler = require('./handlers');

const bot = new TelegramBot(process.env.TBTOKEN, {polling: true});

// const dbConn = new mysql.createConnection({
// 	host: config.DB_HOST,
// 	user: config.DB_USER,
// 	password: config.DB_PWD,
// 	database: config.DB_NAME
// });
// dbConn.connect();
const dbConn = {};

mongoose
	.connect(
		`${config.MONGO_HOST}/${config.MONGO_DATABASE}`,
		{
			useUnifiedTopology: true,
			useNewUrlParser: true,
		}
	)
	.then(async () => {
		console.log('connected to mongodb');
	})
	.catch(err => {
		console.log(err);
	});

// const storage = new Storage({
//   projectId: config.GC_PROJECT_ID,
//   keyFilename: config.GC_KEY
// });

// const tagBucket = storage.bucket(config.GC_BUCKET);
const tagBucket = {};
// const snoo = new snoowrap({
// 		userAgent : "fatt",
// 		clientId : config.REDDIT_CLIENT_ID,
// 		clientSecret : config.REDDIT_CLIENT_SECRET,
// 		refreshToken : config.REDDIT_REFRESH_TOKEN
// });
// const s3 = new S3({
//   accessKeyId: config.S3_ACCESS_KEY,
//   secretAccessKey: config.S3_SECRET_KEY,
//   region: 'ap-south-1',
//   endpoint: config.S3_ENDPOINT,
//   // s3BucketEndpoint: 'telebot-tag.ap-south-1.linodeobjects.com',
// });

const snoo = {}

const tags = {};

bot.onText(/\/help/, handler.helpHandler(bot));
bot.onText(/\/fuck (.*)/, handler.fuckHandler(bot));
bot.onText(/\/echo (.*)/, handler.echoHandler(bot));
bot.onText(/\/whoami/, handler.whoamiHandler(bot));
bot.onText(/\/nim (.*)/, handler.nimHandler(bot, axios));
bot.onText(/\/cheat (.*)/, handler.cheatHandler(bot, axios));
bot.onText(/\/short (.*)/, handler.shortHandler(bot, axios));

// bot.onText(/\/showevent (.*)/, handler.showEventHandler(bot));
// bot.onText(/\/addevent (.*)/, handler.addEventHandler(bot));

bot.onText(/\/tag (.*)/, handler.tagHandler(bot));
bot.onText(/#([^#])+#/, handler.hashTagHandler(bot));
bot.onText(/\$([^$])+\$/, handler.dollarTagHandler(bot));
bot.onText(/\/tagowner (.*)/, handler.tagOwnerHandler(bot));
bot.onText(/\/addtag (.*)/, handler.addTagHandler(bot));
bot.onText(/\/addtagf (.*)/, handler.addTagFHandler(bot, tags));
bot.onText(/\/deletetag (.*)/, handler.deleteTagHandler(bot));
bot.onText(/\/taglist/, handler.tagListHandler(bot));

bot.onText(/\/random/, handler.randomHandler(bot, snoo));
bot.onText(/\/r (.*)/, handler.rHandler(bot, snoo));
bot.onText(/\/ask/, handler.askRedditHandler(bot, snoo));

bot.onText(/{([^{}])+}/, handler.vvSaysHandler(bot));
bot.onText(/<([^<>])+>/, handler.febySaysHandler(bot));

// tag file upload handler
bot.on('photo', handler.uploadTagFileHandler(bot, tags, tagBucket));
// inline query handler
bot.on('inline_query', async (query) => {
	// const inlineResults = [];

	// const res = axios.get()
	bot.answerInlineQuery(query.id, ['a', 'b', query.query]);
});
