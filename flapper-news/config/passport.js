var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

var user = mongoose.model('User');

passport.use(new LocalStrategy(
  function(username, password, done) {
    user.findOne({
      username: username
    }, function(err, user) {
      if (err) {return done(err); }
      if (!user) {
        return done(null, false, {message: 'Incorrect user'});
      }
      if (!user.validPassword(password)) {
        return done(null, false, {message: 'Incorrect password'});
      }
      return done(null, user);
    });
  }
));