const snoowrap = require('snoowrap');

const snoo = new snoowrap({
  userAgent : "fatt",
  clientId : REDDITCLIENTID,
  clientSecret : REDDITCLIENTSECRET,
  refreshToken : REDDITREFRESHTOKEN
});

module.exports = snoo;