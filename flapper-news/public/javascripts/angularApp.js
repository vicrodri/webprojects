var app = angular.module('flapperNews', ['ui.router']);

//Creacion del objeto como factoría.
app.factory('modelo', ['$http', 'auth', function ($http, auth){
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
    return $http.post('/posts', post, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function (data) {
      modelo.posts.push(data);
    })
  };

  //funcion que añade votos positivos al modelo.
  modelo.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote',null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data) {
      post.upvotes+=1;
    });
  };

  //funcion que añade votos negativos al modelo.
  modelo.downvote = function(post) {
    return $http.put('/posts/' + post._id + '/downvote',null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data) {
      post.downvotes+=1;
    });
  };

  //obtiene un post concreto a partir de su id, en este caso la petición 
  //se realiza de forma asíncrona mediante el uso de la promesa.
  modelo.get = function (id) {
    return $http.get('/posts/' + id).then(function(res) {
      return res.data;
    });
  };

  //añade un comentario a un post especifico.
  modelo.addComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments', comment, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    });
  };

  //añade votos positivos a un comentario
  modelo.addCommentVotesUp = function (post, comment) {
    return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote', null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data) {
      comment.upvotes += 1;
    })
  };

  //añade votos negativos a un comentario
  modelo.addCommentVotesDown = function (post, comment) {
    return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/downvote', null, {
      headers: {Authorization: 'Bearer '+auth.getToken()}
    }).success(function(data) {
      comment.downvotes += 1;
    })
  };
  return modelo;
}]);

//servicio de autenticacion, usará la funcion de local storage para almacenar/leer el token
app.factory('auth',['$http', '$window', function ($http, $window) {
  var auth = {};

  auth.savetoken = function(token){
    $window.localStorage['flapper-news-token'] = token;
  };

  auth.getToken = function() {
    return $window.localStorage['flapper-news-token'];
  };

  //se parte el token para obtener la parte entre los 2 '.', que corresponde con el payload.
  //este trozo esta codificado en Base64 que se recupera mediante el metodo $window.atob y mediante
  //el JSON.parse se transforma a una estructura JSON.
  auth.isLoggedIn = function(){
    var token = auth.getToken();

    if (token) {
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.exp > Date.now()/1000;
    } else {
      return false;
    }
  };

  //recupera el usuario actual
  auth.currentUser = function() {
    if (auth.isLoggedIn()) {
      var token = auth.getToken();
      var payload = JSON.parse($window.atob(token.split('.')[1]));

      return payload.username;
    }
  };

  //registra el usuario en BBDD
  auth.register = function(user) {
    return $http.post('/register', user).success(function(data) {
      auth.savetoken(data.token);
    });
  };

  //login usuario
  auth.logIn = function(user) {
    return $http.post('/login', user).success(function(data) {
      auth.savetoken(data.token);
    });
  };

  //logout usuario
  auth.logOut = function() {
    $window.localStorage.removeItem('flapper-news-token');
  };

  return auth;
}]);

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
      controller: 'PostCtrl',
      resolve: {
        post: ['$stateParams', 'modelo', function($stateParams, modelo) {
          return modelo.get($stateParams.id);
        }]
      }
    })
    .state('login', {
      url: '/login',
      templateUrl: '/login.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth) {
        if (auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    })
    .state('register', {
      url: '/register',
      templateUrl: '/register.html',
      controller: 'AuthCtrl',
      onEnter: ['$state', 'auth', function($state, auth) {
        if (auth.isLoggedIn()){
          $state.go('home');
        }
      }]
    });

  $urlRouterProvider.otherwise('home');
}]);

app.controller('MainCtrl', ['$scope', 'modelo', 'auth', function($scope, modelo, auth){
  //variable de prueba
  $scope.isLoggedIn = auth.isLoggedIn;
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

app.controller('PostCtrl', ['$scope', 'post', 'modelo', 'auth', function($scope, post, modelo, auth){
  $scope.isLoggedIn = auth.isLoggedIn;

  //Obtiene el Post correcto.
  $scope.post = post;

  //añadir voto positivo a un comentario
  $scope.addCommentVotesUp = function (comment) {
    modelo.addCommentVotesUp(post, comment);
  };

  //añadir voto negativo a un comentario
  $scope.addCommentVotesDown = function (comment) {
    modelo.addCommentVotesDown(post, comment);
  };

  //añadir comentario
  $scope.addComment = function () {
    if ($scope.body === '') {
      return;
    }
    modelo.addComment(post._id, {
      body: $scope.body,
      author: 'user'
    }).success(function(comment) {
      $scope.post.comments.push(comment);
    });

    $scope.body = '';
  };
}]);

app.controller('AuthCtrl', ['$scope', '$state','auth', function($scope, $state, auth) {
  $scope.user = {};

  $scope.register = function (){
    auth.register($scope.user).error(function (error) {
      $scope.error = error;
    }).then(function() {
      $state.go('home');
    });
  };

  $scope.logIn = function () {
    auth.logIn($scope.user).error(function (error) {
      $scope.error = error;
    }).then(function () {
      $state.go('home');
    });
  };

}]);
//Controlador para la barra de navegacion, expone los metodos de autenticacion a la app.
app.controller('NavCtrl', ['$scope', 'auth', function($scope, auth) {
  $scope.isLoggedIn = auth.isLoggedIn;
  $scope.currentUser = auth.currentUser;
  $scope.logOut = auth.logOut;    
}]);