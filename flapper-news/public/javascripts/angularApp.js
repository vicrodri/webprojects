var app = angular.module('flapperNews', ['ui.router']);

//Configuración del enrutamiento y la navegacion
app.config([
'$stateProvider', '$urlRouterProvider', 
function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl'
    })
    .state('posts', {
      url: '/posts/{id}',
      templateUrl: '/posts.html',
      controller: 'PostCtrl'
    });

  $urlRouterProvider.otherwise('home');
}]);

//Creacion del objeto como factoría.
app.factory('modelo', [function (){
  var modelo = {
    posts: []
  };

  return modelo;
}])

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
    $scope.posts.push({
      title: $scope.title, 
      upvotes: 0,
      downvotes: 0,
      link: $scope.link,
      comments: [
        {author: 'Uno', body: 'cuerpo uno', upvotes: 0, downvotes: 0},
        {author: 'Dos', body: 'cuerpo dos', upvotes: 5, downvotes: 2},
      ]
    });
    $scope.title='';
    $scope.link='';
  };

  //añadir voto positivo a un post
  $scope.addVotesUp = function (post) {
    post.upvotes += 1;
  };

  //añadir voto negativo a un post
  $scope.addVotesDown = function (post) {
    post.downvotes += 1;
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