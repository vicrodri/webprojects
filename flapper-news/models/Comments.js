var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	body: String,
	author: String,
	upvotes: {type: Number, default: 0},
	downvotes: {type: Number, default: 0},
	post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
});

//sumar votos positivos
CommentSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

//sumar votos negativos
CommentSchema.methods.downvote = function(cb) {
  this.downvotes += 1;
  this.save(cb);
};

mongoose.model('Comment', CommentSchema);