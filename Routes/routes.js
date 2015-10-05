module.exports = function(express, app, passport,config,rooms){
	var Router = express.Router();

	var SecurePages = require('./SecurePages.js');

	//route for home page
	Router.get('/', function(req, res, next){
		res.render('index', {title: "New Way to Chat"} );
	})
	//route for asking Facebook authentication. Redirect to require facebook login page
	Router.get('/auth/facebook', passport.authenticate('facebook'));
	//return access back to the app follow by the callback
	Router.get('/auth/facebook/callback', passport.authenticate('facebook', {
		//if the authentication success, then redirect to the route '/chatrooms'
		successRedirect:'/chatrooms',
		//if not redirect to the loging page
		failureRedirect:'/'
	}))
	


	//route for chatrooms page
	Router.get('/chatrooms',SecurePages, function(req,res, next){
		res.render('chatrooms', {title: "Chatrooms", user: req.user, config:config});
	})

	//Route for specific chat room (based on the room's number(room id))
	Router.get('/room/:id', SecurePages, function(req, res, next){
		//findout the room nam by using the id from the url
		var room_name = findTitle(req.params.id);
		res.render('room',{user:req.user, room_number: req.params.id, room_name:room_name, config:config})//id here is the id
																	 				//extracted from the url via the ':'

	})

	//function to find the Room name
	function findTitle(id){
		var index = 0;
		while(index < rooms.length){
			if(rooms[index].room_number == id){
				return rooms[index].room_name;
				break;
			}
			else{
				index++;
				continue;
			}
		}
	}

	//route for log out page
	Router.get('/logout', function(req,res,next){
		req.logout();
		res.redirect('/');
	})


	//Testing
	Router.get('/setcolor', function(req, res, next){
		req.session.favColor = 'Red';
		res.send("Setting color");
	})

	Router.get('/getcolor', function(req, res, next){
		res.send("Color: " + (req.session.favColor === undefined? "Not Found": req.session.favColor));
	})
	app.use('/',Router);
}