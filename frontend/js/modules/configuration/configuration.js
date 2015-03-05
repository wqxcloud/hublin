'use strict';

angular.module('meetings.configuration', ['meetings.session', 'meetings.wizard'])
  .factory('configurationService', ['$q', '$log', 'session', 'configurationHandlerService', function($q, $log, session, configurationHandlerService) {
    function configure(configuration) {
      $log.debug('Configuring conference', configurationHandlerService.getHandlers());

      var jobs = configurationHandlerService.getHandlers().map(function(handler) {
        return handler(configuration);
      });
      return $q.all(jobs);
    }

    return {
      configure: configure
    };

  }])
  .factory('configurationHandlerService', [function() {
    var handlers = [];

    function register(handler) {
      if (!handler) {
        return;
      }
      handlers.push(handler);
    }

    function getHandlers() {
      return handlers;
    }

    return {
      register: register,
      getHandlers: getHandlers
    };
  }])
  .directive('conferenceConfiguration', ['$log', 'widget.wizard', 'session', 'configurationService', function($log, Wizard, session, configurationService) {

    function link($scope) {

      $scope.configuration = {
        displayName: session.getUsername()
      };

      $scope.createConference = function() {
        configurationService.configure($scope.configuration)
         .then(onSuccess, onFailure);
      };

      $scope.wizard = new Wizard([
        '/views/live-conference/partials/configuration/username'
      ], $scope.createConference);

      function onSuccess() {
        $log.info('Conference has been configured');
        session.setConfigured(true);
      }

      function onFailure(err) {
        $log.error('Failed to configure', err);
        session.setConfigured(false);
      }
    }

    return {
      restrict: 'E',
      templateUrl: '/views/modules/configuration/configuration',
      link: link
    };
  }])
  .directive('bitrateConfiguration', ['easyRTCService', 'easyRTCBitRates', function(easyRTCService, easyRTCBitRates) {
    return {
      restrict: 'E',
      templateUrl: '/views/modules/configuration/bitrate-configuration',
      link: function($scope) {
        var bitRates = Object.keys(easyRTCBitRates);

        $scope.selectBitRate = function(rate) {
          if (bitRates.indexOf(rate) >= 0) {
            $scope.selected = rate;
            easyRTCService.configureBandwidth(rate);
          }
        };

        $scope.isSelected = function(rate) {
          return $scope.selected === rate;
        };

        $scope.selectBitRate('nolimit');
      }
    }
  }])
