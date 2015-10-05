var express = require('express');
var app = express(),
	path = require('path'),
	//enable to use session ID
	cookieParser = require('cookie-parser'),
	//process data between multiples pages
	session = require('express-session'),
	config = require('./config/config.js'),
	//store the session value insdes the mongolab account
	ConnectMongo = require('connect-mongo')(session),
	//connect to the mongolab account
	Mongoose = require('mongoose').connect(config.dbURL),
	//obtaint the authentication for users
	passport = require('passport'),
	FacebookStrategy = require('passport-facebook').Strategy,
	//a room contain room number and room name
	Rooms = [];

//set up the path for views folder from the current(home) 
// directory folder
app.set('views', path.join(__dirname, 'views'));

//use Hogan template engine to deploy Html files
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

//find static files such as .css and image files
//so no longer need '/public' as a part of the path in Html files
app.use(express.static(path.join(__dirname,'public')));

//to enable to store session ID
app.use(cookieParser());

//set uo the enviroment mode or if the NOVE_ENV 
//does not exit set it to 'development mode'
var env = process.env.NODE_ENV || 'development';

//development setting
if(env === 'development'){
	app.use(session({secret: config.sessionSecret, saveUninitialized: true, resave: true}));
}
//production setting
else{


	app.use(session({secret: config.sessionSecret,
		store: new ConnectMongo({
			//Connect Mongo Database to store sessions
			//and reuse the connection the mongoose module 
			//instead create another connection such as 
			//url: config.dbURL,
			mongooseConnection: Mongoose.connection,
			//all the session value converted to strings
			stringify: true

		})
		, saveUninitialized: true, resave: true}));

}

//get the passport active
app.use(passport.initialize());
//to use the persistent login session
app.use(passport.session());

require('./auth/passportAuth.js')(passport, FacebookStrategy, config, Mongoose);

//create a route mapping url responses
require('./Routes/./routes.js')(express,app,passport,config, Rooms);
// app.listen(3000, function(){
// 	console.log("ChatCat working on the port : 3000");
// 	console.log('Mode: '+ env);
// })

app.set('port', process.env.PORT || 3000);
//enable functioning real-time chating by using package socket.io
var server = require('http').createServer(app);
var IO = require('socket.io').listen(server);
require('./socket/socket.js')(IO, Rooms);

server.listen(app.get('port'), function(){
	console.log("Creating server for Chatcat on port:" + app.get('port'));
});
