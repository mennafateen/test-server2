var http = require('http');
var url = require('url');
var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var app = express();

var id;
var random;
var contents;
var randomQuote = "Quote is not yet initialized.";
var queryResult;
var randomID;
var NumberOfQuotes;

var knex = require('knex')({
  client: 'mysql',
  connection: {
	host     : 'itscstaging.cech.uc.edu',
	port	 : '3306',
    user     : 'root',
    password : 'password',
    database : 'test',
    charset  : 'utf8'
  }
});
var bookshelf = require('bookshelf')(knex);

// Map table to an obj:
var Quote = bookshelf.Model.extend({
  tableName: 'AbMe.quotes'
});

// Select * from 'quotes'
app.get('/random', function(req, res){
	new Quote({id : getRandomNumber()})
	.fetch()
	.then(function(model) {
	console.log("Text is: " + model.get('text'));
	res.send(model.get('text'));
  }).catch(function(error) {
      console.log(error);
      res.send('An error occured');
    });
});

// Get number of quotes in table:
Quote.forge()
  .count()
  .then(function(count) {
	NumberOfQuotes = count;
    console.log("Number of rows: " + count);
  });

// Get a random number between 0 and NumberOfQuotes:
function getRandomNumber(){
	var randomNum = Math.ceil(Math.random() * NumberOfQuotes);
	console.log("ID: " + randomNum);
	return randomNum;
}

/* NORMAL CONNECTION TO DB:
// Connection params:
var connection = mysql.createConnection({
	host     : 'itscstaging.cech.uc.edu', /
	user     : 'root',
	password : 'password'
});

// Connect to DB:
connection.connect(function(err) {
  if (err){
	console.log('Connection to database failed!');
	return;
  }
  console.log("Database connected!");
  connection.query('SELECT * FROM AbMe.quotes', function (error, result) {
			if (error){ 
				console.log('Invalid query statement!');
				return;
			}
			queryResult = result;
			id = getRandomNumber();
			randomQuote = result[id].text;
			console.log("First result: " + randomQuote);
	});
});

// Get a random quote:
function getRandom(){
	id = Math.round(Math.random() * 8);
	console.log(id);
	random = contents[id].text;
	return random;
}

// Read JSON file:
fs.readFile("quotes.json", function(err, data){
		if (err) {
			console.log(err);
			return;}
		console.log("JSON file is read!");
		contents = JSON.parse(data);
});


// Manage '/random' route:
app.get('/random', function(req, res){
		//random = getRandom(); // For the JSON file
		console.log("Result: " + randomQuote);
		res.send(randomQuote);
		id = getRandomNumber();
		randomQuote = queryResult[id].text; // FIX QUERYRESULT
});

/*
var server = http.createServer(function(req, res){
	res.writeHead(200, {'Content-Type' : 'text/html'});
	if (/^\/random/.test(req.url)) {
		random = getRandom();
		res.write(random);
	} 
	else {
		res.write('404 Page not found!');
	}
	res.end();
});

server.listen(8888);
*/

app.listen(8888, function(){
	console.log('Server is running...');	
});