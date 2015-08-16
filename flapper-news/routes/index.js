var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Comment = mongoose.model('Comment');
var Post = mongoose.model('Post');

/* crea un objeto o parametro comun a diferentes enrutamientos 
que se ejecuta al indicar el parametro :post en la url*/
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);

  query.exec(function(err, post) {
    if (err){
      return next(err);
    }
    if (!post) {
      return next(new Error('can\'t find post'));
    }
    req.post = post;
    return next();
  }); 
});

/* crea un objeto o parametro comun a diferentes enrutamientos 
que se ejecuta al indicar el parametro :comment en la url*/
router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);

  query.exec(function(err, comment) {
    if (err){
      return next(err);
    }
    if (!comment) {
      return next(new Error('can\'t find comment'));
    }
    req.comment = comment;
    return next();
  }); 
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Devuelve todos los Posts */
router.get('/posts', function(req, res, next) {
	Post.find(function(err,posts){
		if(err){
			return next(err);
		}
    res.json(posts);
	}); 
});

// Inserta un post en la base de datos 
router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);

  post.save(function(err, post) {
    if (err){
      return next(err);
    }

    res.json(post);
  });
});

//devuelve un post concreto
router.get('/posts/:post', function(req, res) {
  req.post.populate('comments', function (err, post) {
     if (err){
      return next(err);
    }

    res.json(post);
  });
});

module.exports = router;

//suma votos positivos a un post
router.put('/posts/:post/upvote', function(req, res, next) {
  req.post.upvote(function (err, post) {
    if (err){
      return next(err);
    }
    res.json(post);
  });
});

//suma votos negativos a un post
router.put('/posts/:post/downvote', function(req, res, next) {
  req.post.downvote(function (err, post) {
    if (err){
      return next(err);
    }
    res.json(post);
  });
});

//crear comentarios a un post concreto
router.post('/posts/:post/comments', function (req, res, next) {
  var Comment = new Comment(req.body);
  comment.post = req.post;

  comment.save(function(err, comment) {
    if (err){return next(err);}

    req.post.comments.push(comment);
    req.post.save(function(err,post){
      if (err){return next(err);}

      res.json(comment);
    });
  });
});

//suma votos positivos a un comentario
router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
  res.comment.upvote(function (err, comment) {
    if (err){
      return next(err);
    }
    res.json(comment);
  });
});

//suma votos negativos a un comentario
router.put('/posts/:post/comments/:comment/downvote', function(req, res, next) {
  res.comment.downvote(function (err, comment) {
    if (err){
      return next(err);
    }
    res.json(comment);
  });
});


module.exports = router;
