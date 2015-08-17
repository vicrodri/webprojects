var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, unique: true},
	hash: String,
	salt: String
});

//funcion que genera la clave del usuario
UserSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString('hex');
	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

//funcion que valida la clave
UserSchema.methods.validPassword = function(password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

	return this.hash === hash;
};

//funcion que genera el token de autenticacion.
//SECRET: token para gestionar la autenticacion.
UserSchema.methods.generateJWT = function() {
  //validez de 60 dias.
  var hoy = new Date();
  var exp = new Date(hoy);
  exp.setDate(hoy.getDate() + 60);

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000)
  }, 'SECRET');
};

mongoose.model('User', UserSchema);