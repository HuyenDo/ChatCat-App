
//middleware to check whether the user is still online to have access to the chatrooom page
//if not return to the loging page
module.exports = function(req, res, next){
	if(req.isAuthenticated()){
		next();
	}
	else{
		res.redirect('/');
	}
}