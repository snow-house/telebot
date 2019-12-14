#! /usr/bin/node

const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TBTOKEN;
const axios = require('axios');

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/help/, (msg, match) => {

	const chatId = msg.chat.id;
	const resp = `Help
	- /nim [query], itb nim finder
	- /echo [msg], echo.. literally
	- /whoami , shows who you really are
	- /cheat [card] [card] [card] [card] , cheat in 24 solver`;


	bot.sendMessage(chatId, resp);

});

bot.onText(/\/fuck (.*)/, (msg, match) => {
	const chatId = msg.chat.id;
	var respList = ['I know right', `yeah, fuck ${match[1]}`, 'damn right']
	const resp = respList[Math.floor(Math.random()*(respList.length))];

	bot.sendMessage(chatId, resp);
});


bot.onText(/\/echo (.*)/, (msg, match) => {

	const chatId = msg.chat.id;
	console.log(msg)
	const resp = match[1];

	console.log(`someone said to me ${resp}`);

	bot.sendMessage(chatId, resp);

});

bot.onText(/\/whoami/, (msg, match) => {

	const chatId = msg.chat.id;
	const userId = msg.from.id;
	const username = msg.from.username;
	const firstname = msg.from.first_name;

	const resp = `you are user ${userId} @${username} or should i call you ${firstname}`

	bot.sendMessage(chatId, resp);

});

bot.onText(/\/nim (.*)/, (msg, match) => {

	const chatId = msg.chat.id;
	var resp = '';

	console.log(`someone wants to findout who is ${match[1]}`);

	axios.get(`http://aryuuu.ninja:6969/get/nim/${match[1]}`)
	.then((res) => {
		if (res.data.count === 0) {
			resp = res.data.message;
		} else {
			for (let i = 0; i < 10 && i < res.data.count; i++) {
				
				let data = res.data.data[i];

				let nama = data.nama;
				let jurusan = data.jurusan;
				let fakultas = data.fakultas;
				let tpb = data.tpb;
				let s1 = data.s1;

				resp += `${nama} ${tpb} ${s1 !='NULL'?s1:''} ${fakultas} ${jurusan}\n`
			}
		}
		if (res.data.count > 10) {
			resp += `\nto show more use /nim -a [query]`;
		}

		bot.sendMessage(chatId, resp);
	})
	.catch((err) => {
		console.log(err);
	});

	

});


bot.onText(/\/cheat (.*)/, (msg, match) => {
	const chatId = msg.chat.id;
	var resp = '';

	var nums = match[1].split(' ');
	// console.log(nums);
	axios.get(`http://aryuuu.ninja:6969/24solver/${nums[0]}/${nums[1]}/${nums[2]}/${nums[3]}`)
	.then((res) => {
		let d = res.data;
		resp += `${d.message}\n`;
		resp += `${d.count === 0?'':d.data[0]}`;

		bot.sendMessage(chatId, resp);
	})
	.catch((err) => {
		console.log(err)
	})

	
});