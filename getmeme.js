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

// scrapeSubreddit()
module.exports.scrapeSubreddit = scrapeSubreddit;
