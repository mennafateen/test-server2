var http = require('http');
var url = require('url');
var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var flash = require('connect-flash');
var session = require('express-session');

var id;
var random;
var contents;
var randomQuote = "Quote is not yet initialized.";
var queryResult;
var randomID;
var NumberOfQuotes;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(passport.initialize());
//app.use(passport.session());
app.use(session({ cookie: { maxAge: 60000 }, 
                  secret: 'woot',
                  resave: false, 
                  saveUninitialized: false}));
app.use(flash());
		
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

var User = bookshelf.Model.extend({
	tableName: 'AbMe.users'
});


// Implementing passport.serializeUser and passport.deserializeUser:
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Select * from 'quotes' order by rand():
app.get('/random', function(req, res){
	bookshelf.knex.raw(
    'SELECT * FROM AbMe.quotes ORDER BY rand() LIMIT 1'
    )
  .then(data => {
	console.log(data[0][0]);
	res.json(data[0][0]);
  })
  .catch(err => {
    console.log(err);
  });
});

  
// Check password validity:
function isValidPassword(user, password) {
	return user.get("userPW") === password;
}

var jsonify = function (ele) { return ele.toJSON(); };


// Passport -> Find user: 
passport.use(new LocalStrategy(
  function(username, password, done) {
	 User
		.where({ userID: username })
		.fetch()
		.then(function(user) {
			if (!isValidPassword(user, password)) {
				console.log('Incorrect pw!');
				return done(null, false, { message: 'Invalid username or password ' });
			}
			
			return done(null, user.toJSON());
		})
		.catch(function(err) {
			console.log(err);
		});
  }  
));
/*
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ 'userID': username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!isValidPassword(user, password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
*/  
  
// Base route:
app.get('/', function(req, res){
	res.send('Hello, User!');
	res.end();
});

// GET login route failure:
app.get('/loginsuccess', function(req, res){	
	res.json({status: 200});
});

// GET login route success:
app.get('/loginfailure', function(req, res){
	res.json({status: 404});
});

// Login route:
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.json({status: 404})}
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.json({status: 200});
    });
  })(req, res, next);
});

/*
// Login route:
app.post('/login', passport.authenticate('local', function(req, res) {
	res.redirect('/loginsuccess');
	console.log("LOGGED IN!");
	res.end();
}));
	*/											
  /* OLD RANDOM METHOD: select * from 'quotes' where id = randomID
	new Quote({id : getRandomNumber()})
	.fetch()
	.then(function(model) {
	console.log("Text is: " + model.get('text'));
	res.json(model);
  }).catch(function(error) {
      console.log(error);
      res.send('An error occured');
    });*/

// Select * from 'quotes'
app.get('/all', function(req, res) {
  new Quote().fetchAll()
    .then(function(quotes) {
      res.json(quotes);
    }).catch(function(error) {
      console.log(error);
      res.send('An error occured');
    });
});

// Add a new quote route:
app.post('/add', function (req, res) {
	new Quote({
      text: req.body.quotetext
    })
    .save()
    .then(function (quote) {
		res.json(quote);
    })
    .catch(function (err) {
		res.json(err);
    }); 
  });

// Delete a quote route:
app.post('/delete', function (req, res) {
    new Quote({id: req.body.id})
    .fetch({require: true})
    .then(function (quote) {
      quote.destroy()
      .then(function () {
        res.json({error: true, data: {message: 'Quote successfully deleted'}});
      })
      .catch(function (err) {
        res.status(500).json({error: true, data: {message: err.message}});
      });
    })
    .catch(function (err) {
      res.status(500).json({error: true, data: {message: err.message}});
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

app.listen(8000, function(){
	console.log('Server is running...');	
});
