//script.js
  var reportingApp = angular.module("reportingApp",['ui.router']);

  reportingApp.run(function($pouchDB) {
    $pouchDB.setDatabase("reportingAppTEST");
    //$pouchDB.sync("http://localhost:4984/reportingAppTEST");
  });

  reportingApp.config(function($stateProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise("/");

    $stateProvider

    .state("dashboard",{
      url: "/",
      templateUrl : "pages/dashboard.html",
      controller : "dashboardController"
    })

    .state("entry",{
      url : "/entry",
      templateUrl : "pages/entry.html",
      controller : "entryController"
    })

    .state("entryview", {
      url:"/view/:id",
      templateUrl : "pages/view.html",
      controller : "viewController"
    })

    .state("search",{
      url : "/search",
      templateUrl : "pages/search.html",
      controller : "searchController"
    })

    .state("results",{
      url : "/results/:searchtext",
      templateUrl : "pages/results.html",
      controller : "resultsController",
    })

    .state("submitted",{
      url : "/submitted/:success",
      templateUrl : "pages/submitted.html",
      controller : "submittedController"
    });
  });

  reportingApp.controller("dashboardController", function($scope) {
    //nothing really seems to be needed here
    //maybe connect to database and stuff?
  });

  reportingApp.controller("entryController", function($scope,$state,$pouchDB) {
    var data = {};
    $scope.save = function(data){
      $pouchDB.insert(data)
      .then(function(response){
        $state.go("submitted",{success : response.ok.toString()});
      })
      .catch(function(err){
        console.log(err);
        $state.go("submitted",{success : 'false'});
      });
    };
    $scope.submit = function() {
      data = {
        _id : new Date().toISOString(),
        name : this.name,
        activity : this.activity,
        date : this.date
      };
      $scope.save(data);
    };
  });

  reportingApp.controller("viewController", function($scope, $stateParams) {
    //TODO retrieve database entry from stateParams id
    $scope.id = $stateParams.id;
    $scope.result = {name:"Erik",activity:"worked hard",date:"05/01/2016"};
  });

  reportingApp.controller("resultsController", function($scope,$stateParams) {
    //TODO link results to database
    $scope.results = [{_id:1,name:"Erik",activity:"worked hard",date:"05/01/2016"},
                      {_id:2,name:"Jueun",activity:"worked harder than erik",date:"05/02/2016"},
                      {_id:3,name:"Atif",activity:"made interns work hard",date:"05/03/2016"}];
    $scope.searchtext = $stateParams.searchtext;
  });

  reportingApp.controller("searchController", function($scope,$state) {
    $scope.data = '';
    $scope.submit = function() {
        var text = this.text;
        $state.go("results",{searchtext : text});
    };
  });

  reportingApp.controller("submittedController", function($scope,$stateParams) {
    $scope.success = $stateParams.success;
    if ($scope.success=='true') {
      $scope.message = "Activity recorded!";
    }
    else {
      $scope.message = "Activity failed to record.";
    }
  });

  reportingApp.service("$pouchDB", ["$rootScope","$q", function($rootScope, $q) {
    this.database = null;

    this.setDatabase = function(databaseName) {
      this.database = new PouchDB(databaseName);
    }

    this.sync = function(remoteDatabase) {
      this.database.sync(remoteDatabase, {live: true, retry: true});
    }

    this.insert = function(doc) {
      var deferred = $q.defer();
      this.database.put(
        doc
      ).then(function(response) {
          deferred.resolve(response);
        })
        .catch(function(err) {
          deferred.reject(err);
        });
      return deferred.promise;
    }
  }]);
