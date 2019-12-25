#!/usr/bin/node

const snoowrap = require("snoowrap");

async function scrapeSubreddit() {

	const r = new snoowrap({
			userAgent : "fatt",
			clientId : process.env.REDDITCLIENTID,
			clientSecret : process.env.REDDITCLIENTSECRET,
			refreshToken : process.env.REDDITREFRESHTOKEN
	});
	
	var subreddit = await r.getSubreddit("dankmemes");
	var topPosts = await subreddit.getTop({time: "day", limit: 100});
	
	let data = [];

	topPosts.forEach(post => {
			
			data.push({
				link: post.url,
				text: post.title,
				score: post.score
			})
	});
	console.log(data);
	// return data
}

function test() {
	
	const r = new snoowrap({
			userAgent : "fatt",
			clientId : process.env.REDDITCLIENTID,
			clientSecret : process.env.REDDITCLIENTSECRET,
			refreshToken : process.env.REDDITREFRESHTOKEN
	});

	var posts = [];
	r.getSubreddit("dankmemes")
	.getTop({
		time: "day",
		limit: 10
	})
	.then(res => {
		res.forEach(post => {
			posts.push({
				title: post.title,
				link : post.url
			})
		})
		console.log(posts)
	})
	.catch(err => {
		console.log(err)
	})

}


// scrapeSubreddit()
module.exports.scrapeSubreddit = scrapeSubreddit;
module.exports.test = test;
