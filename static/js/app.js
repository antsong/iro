;(function (angular) { 'use strict';
    angular.module('iro', [
        'kTap',
        'kDrag',
        'kScroll',
        'ngAnimate',
        'angular-loading-bar',
        'ui.router',
        'iro.home',
        'iro.video',
        'iro.music'
    ]).config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: '/static/partials/home.html',
                controller: 'HomeCtrl'
            })
            .state('video', {
                url: '/video',
                templateUrl: '/static/partials/video.html',
                controller: 'VideoCtrl'
            })
            .state('music', {
                url: '/music',
                templateUrl: '/static/partials/music/index.html',
                controller: 'MusicCtrl'
            })
            .state('music.play', {
                url: '/:name',
                templateUrl: '/static/partials/music/play.html',
                controller: 'MusicPlayCtrl'
            })
            .state('article', {
                url: '/article',
                template: 'article'
            })
            .state('wallpaper', {
                url: '/wallpaper',
                template: 'wallpaper'
            })
            .state('admin.login', {
                url: '/admin/login',
                template: '<k-login id="login"></k-login>',
                controller: 'LoginCtrl'
            })
            .state('register', {
                url: '/register',
                templateUrl: '/static/partials/register.html'
            });

        $urlRouterProvider
            .otherwise('/');

        $locationProvider.html5Mode(true).hashPrefix('!');
    }]).controller('MainCtrl', ['$scope' ,'$state', 'musicPlayer', '$window',
    function ($scope ,$state, musicPlayer, $window) {
        $scope.setUser = function (user) {
            if ($scope.$$phase) {
                $scope.user = user; 
            } else {
                $scope.$apply(function () {
                    $scope.user = user;    
                });
            }
        };

        $scope.stateGo = function (sref) {
            $state.go(sref);
        };

        $scope.openWindow = function (href) {
            $window.open(href);
        };

        $scope.global = {
            get customWallpaperSrc() {
                if (!$state.includes('music') && musicPlayer.paused) {
                    return null;
                }
                if (!musicPlayer.currentMusic) {
                    return null;
                }
                return musicPlayer.currentMusic.bgSrc;
            }
        };
    }]).directive('html', ['$window', '$document', '$state', '$timeout', function ($window, $document, $state, $timeout) {
        var document = $document[0];

        return {
            restrict: 'E',
            link: function (scope, element, attrs, controller) {
                bindEvents();

                scope.$on('$stateChangeSuccess', function (e, toState, toParams, fromState) {
                    if (!$state.includes(fromState.name) && fromState.name !== 'home' && !fromState.abstract) {
                        element.addClass('state-back');
                    } else {
                        element.removeClass('state-back');
                    }
                });

                // 修复iPad ios7下的高度异常
                if (navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i)) {
                    $('html').addClass('ipad ios7');
                }

                $($window)
                    .on('resize', function () {
                        if ($window.innerWidth / $window.innerHeight >= 4 / 3) {
                            $('html').removeClass('high-screen').addClass('wide-screen');
                        } else {
                            $('html').removeClass('wide-screen').addClass('high-screen');
                        }
                        if ($('html').hasClass('ipad ios7')) {
                            $('body').height(window.innerHeight);
                        }
                    })
                    .triggerHandler('resize');

                var wallpaperSrc = '/static/images/wallpaper.jpg';

                var xhr = new XMLHttpRequest();
                xhr.open('GET', wallpaperSrc);
                xhr.responseType = 'blob';
                xhr.onprogress = function (e) {
                    var percent = e.loaded / e.total;

                    $('#loading_cover .progress-bar').css('width', (percent * 100) + '%');
                };
                xhr.onload = function () {
                    $('#loading_cover .progress-bar').css('animation', 'fade-out .8s .4s forwards');
                    $window.wallpaperBlob = this.response;
                    scope.wallpaperSrc = window.URL.createObjectURL(this.response);
                    $timeout(function () {
                        scope.loaded = true;
                    }, 800);
                };
                xhr.send();

                function bindEvents() {
                    $document
                        .on('dragstart', function (e) {
                            e.preventDefault();
                        })
                        .on('touchmove', function (e) {
                            e.preventDefault();
                        })
                        .on('mouseenter', '.hoverable', function (e) {
                            $(e.currentTarget).addClass('hover');
                        })
                        .on('mouseleave', '.hoverable', function (e) {
                            $(e.currentTarget).removeClass('hover');
                        })
                        .on('touchstart mousedown', '.activable', function (e) {
                            $(e.currentTarget).addClass('active');
                        })
                        .on('touchend touchcancel mouseup mouseleave', '.activable', function (e) {
                            $(e.currentTarget).removeClass('active');
                        })
                        // .on('touchstart touchend touchmove click tap mousedown mouseup', function (e) {
                        //     $('.container').append(e.type + '<br />');
                        // })
                        .on('ktap', 'a', function (e) {
                            if (e.pointerType === 'touch' && $(e.currentTarget).attr('href')) {
                                $(e.currentTarget).trigger('click');
                            }
                        })
                        .on('touchstart touchend', function (e) {
                            if ($(e.target).hasClass('not-prevent-touch-default')) {
                                return;
                            }
                            e.preventDefault();
                        });
                }
            }
        };
    }]).config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
        cfpLoadingBarProvider.includeSpinner = false;
    }]);
})(angular);