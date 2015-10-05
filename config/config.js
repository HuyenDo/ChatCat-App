 //this file is responsible for providing the setting of the mode 
//the app running in
module.exports = require('./' + (process.env.NODE_ENV || 'development')+ '.json');