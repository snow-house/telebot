#! /usr/bin/node

const TelegramBot = require('node-telegram-bot-api');
const token = 'your token';
const axios = require('axios');

const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/help/, (msg, match) => {

	const chatId = msg.chat.id;
	const resp = `Help
	- /nim [name||[nim], itb nim finder
	- /echo [msg], echo.. literally`;

	bot.sendMessage(chatId, resp);

});


bot.onText(/\/echo (.*)/, (msg, match) => {

	const chatId = msg.chat.id;
	const resp = match[1];

	console.log(`someone said to me ${resp}`);

	bot.sendMessage(chatId, resp);

});

bot.onText(/\/nim (.*)/, (msg, match) => {

	const chatId = msg.chat.id;
	var resp = '';

	console.log(`someone wants to findout who is ${match[1]}`);

	axios.get(`http://aryuuu.ninja/nims/${match[1]}`)
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
		resp += `to show more use /nim -a [name]||[nim]`;

		bot.sendMessage(chatId, resp);
	})
	.catch((err) => {
		console.log(err);
	});

	

});