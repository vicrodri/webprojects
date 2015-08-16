var app = angular.module('flapperNews', ['ui.router']);

//Configuración del enrutamiento y la navegacion
app.config([
'$stateProvider', '$urlRouterProvider', 
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['modelo', function(modelo) {
          return modelo.getAll();
        }]
      }
    })
    .state('posts', {
      url: '/posts/{id}',
      templateUrl: '/posts.html',
      controller: 'PostCtrl'
    });

  $urlRouterProvider.otherwise('home');
}]);

//Creacion del objeto como factoría.
app.factory('modelo', ['$http', function ($http){
  var modelo = {
    posts: []
  };

  //funcion del modelo que recupera todos los posts de BBDD.
  modelo.getAll = function() {
    return $http.get('/posts').success(function (data) {
      angular.copy(data, modelo.posts);
    });
  };

  //funcion que crea los post en BBDD.
  modelo.create = function(post) {
    return $http.post('/posts', post).success(function (data) {
      modelo.posts.push(data);
    })
  };

  //funcion que añade votos positivos al modelo.
  modelo.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote').success(function(data) {
      post.upvotes+=1;
    });
  };

  //funcion que añade votos negativos al modelo.
  modelo.downvote = function(post) {
    return $http.put('/posts/' + post._id + '/downvote').success(function(data) {
      post.downvotes+=1;
    });
  };

  return modelo;
}]);

app.controller('MainCtrl', ['$scope', 'modelo', function($scope, modelo){
  //variable de prueba
  $scope.test = 'Hello World';

  //lista de posts se enlaza al modelo para que exista en toda la aplicación.
  $scope.posts = modelo.posts;

  //añadir elemento a la lista de posts
  $scope.addPost = function () {
    if (!$scope.title || $scope.title==='') {
      return;  
    }
    modelo.create({
      title: $scope.title,
      link: $scope.link
    });
    
    $scope.title='';
    $scope.link='';
  };

  //añadir voto positivo a un post
  $scope.addVotesUp = function (post) {
    modelo.upvote(post);
  };

  //añadir voto negativo a un post
  $scope.addVotesDown = function (post) {
    modelo.downvote(post);
  };
}]);

app.controller('PostCtrl', ['$scope', '$stateParams', 'modelo', function($scope, $stateParams, modelo){
  //Obtiene el Post correcto.
  $scope.post = modelo.posts[$stateParams.id];

  //añadir voto positivo a un comentario
  $scope.addCommentVotesUp = function (comment) {
    comment.upvotes += 1;
  };

  //añadir voto negativo a un comentario
  $scope.addCommentVotesDown = function (comment) {
    comment.downvotes += 1;
  };

  //añadir comentario
  $scope.addComment = function () {
    if ($scope.body === '') {
      return;
    }
    $scope.post.comments.push({
      body: $scope.body,
      author: 'user',
      upvotes: 0,
      downvotes: 0
    });
    $scope.body = '';
  };
}]);