require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const mongoose = require('mongoose');
const snoowrap = require('snoowrap');

const config = require('./config');
const handler = require('./handlers');

const bot = new TelegramBot(process.env.TBTOKEN, {polling: true});

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

// const snoo = new snoowrap({
// 		userAgent : "aryuuu",
// 		clientId : config.REDDIT_CLIENT_ID,
// 		clientSecret : config.REDDIT_CLIENT_SECRET,
// 		refreshToken : config.REDDIT_REFRESH_TOKEN
// });

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

// bot.onText(/\/random/, handler.randomHandler(bot, snoo));
// bot.onText(/\/r (.*)/, handler.rHandler(bot, snoo));
// bot.onText(/\/ask/, handler.askRedditHandler(bot, snoo));

bot.onText(/{([^{}])+}/, handler.vvSaysHandler(bot));
bot.onText(/<([^<>])+>/, handler.febySaysHandler(bot));

// tag file upload handler
bot.on('photo', handler.uploadTagFileHandler(bot, tags));
// inline query handler
bot.on('inline_query', handler.inlineHandler(bot));
