;(function (angular) { 'use strict';
  angular.module('iro.services.wallpaper', [])
    .factory('Wallpaper', ['$resource', function ($resource) {
      return $resource('/api/wallpaper/:name');
    }]);
})(angular);