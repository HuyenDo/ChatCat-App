module.exports = function(passport, FacebookStrategy, config, Mongoose){

	//create the user schema for mongoose interaction with database
	var userSchema = new Mongoose.Schema({
		profileID: String,
		fullname: String,
		profilePic: String
	})
	var userModel = Mongoose.model('user', userSchema);

	//to store user's data into the session(user's id from mongodb is store)
	//so that the data can be used across the pages
	passport.serializeUser(function(user, done){
		done(null, user.id);
	})
	//return the user's data via the id and returns the data 
	//regards to the specific id
	passport.deserializeUser(function(id, done){
		userModel.findById(id, function(err, user){
			done(err,user);
		})
	})

	passport.use(new FacebookStrategy({
		clientID : config.fb.AppID,
		clientSecret : config.fb.AppSecret,
		callbackURL : config.fb.CallbackURL,
		//data requesting facebook to send back the data profile
		profileFields : ['id', 'displayName', 'photos']
	}, function(accessToken, refreshToken, profile, done){
		//check if the user already exist in the MongoDb database
		//if not create a new one and return the profile of the user
		//if the user exits just return the profile
		userModel.findOne({'profileID': profile.id}, function(err, result){
			if(result){
				done(null, result);
			}
			else{
				//create a new user
				var newUser = new userModel({
					profileID: profile.id,
					fullname: profile.displayName,
					profilePic: profile.photos[0].value || ''
				})

				//save the new data info into the database
				newUser.save(function(err){
					done(null, newUser);
				})
			}
		})
	}))
}