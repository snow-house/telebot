const mysql = require('mysql');

const dbConn = new mysql.createConnection({
	host: "localhost",
	user: dbuser,
	password: dbpwd,
	database: dbname
});

dbConn.connect();

module.exports = dbConn;