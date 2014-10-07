var jive = require("jive-sdk");
var q = require('q');

var tileTargetStore = jive.service.persistence();

/**
 * Handles actually pushing data to the tile instance
 * @param instance
 */
function processAddTileInstance(tileInstance) {
  var deferred = q.defer();
  
  jive.logger.debug('Received Tile Registration', tileInstance.name, ' : ', tileInstance.id);
  
  tileTargetStore.save('tileInstance',tileInstance.id,tileInstance).then(
    function() {
      jive.logger.debug('Successfully Saved Tile Definition', tileInstance.name, ' : ', tileInstance.id);
      tileTargetStore.findByID('placeTarget',tileInstance.config.parent).then(
        function (found) {
          found.tiles.push(tileInstance.id);
          tileTargetStore.save('placeTarget',tileInstance.config.parent,found).then(
            function() {
              jive.logger.debug('Successfully Saved Tile Reference in PlaceTargets', tileInstance.name, ' : ', tileInstance.id);
              deferred.resolve();
            },
            function(error) {
              jive.logger.debug('Failed to Save Tile Reference in PlaceTargets', tileInstance.name, ' : ', tileInstance.id);
              deferred.reject();
            });
        },
        function (notFound) {
          jive.logger.debug('New Place, Creating New Place Target Record', tileInstance.name, ' : ', tileInstance.id);          
          tileTargetStore.save('placeTarget',tileInstance.config.parent,
            {
              id: tileInstance.config.parent,
              uri : tileInstance.config.parent,
              tiles: [ tileInstance.id ]
            }).then(
            function() {
              jive.logger.debug('Successfully Saved NEW Tile Reference in PlaceTargets', tileInstance.name, ' : ', tileInstance.id);
              deferred.resolve();
            },
            function(error) {
              jive.logger.debug('Failed to Save NEW Tile Reference in PlaceTargets', tileInstance.name, ' : ', tileInstance.id);
              deferred.reject();
            });
          });
    });

  return deferred.promise;  
};
      
function processRemoveTileInstance(tileInstance) {
  jive.logger.debug('Received Tile Removal', tileInstance.name, ' : ', tileInstance.id);
  
  //TODO: NEED TO REMOVE FROM tileInstance AND placeTarget
  
};

exports.verifyPlaceUser = function (placeID,userID) {
  var deferred = q.defer();
  
    tileTargetStore.findByID(placeID).then(
      function(found) {
        //TODO PULL OUT INFORMATION FROM RESULTS AND NORMALIZE FOR RETURN????
        deferred.resolve(found);  
      },
      function (error) {
        deferred.reject(error);
      }
    );
  
  //TODO: IMPLEMENT
  deferred.resolve(true);
  
  return deferred.promise;
};

exports.authorizeUsers = function (placeTarget,users) {
  var deferred = q.defer();
  
  tileTargetStore.save('placeTargetUsers', placeTarget.id,
      {
          id : placeTarget.id,
          uri : placeTarget.uri,
          users : users
      }).then(
        function() {
          deferred.resolve();  
        },
        function(error) {
         deferred.reject(error);
        }    
    );

  return deferred.promise;
};

exports.findTilesByPlaceID = function (placeID) {
    var deferred = q.defer();
  
    tileTargetStore.findByID('placeTarget',placeID).then(
      function(found) {
        //TODO PULL OUT INFORMATION FROM RESULTS AND NORMALIZE FOR RETURN????
        deferred.resolve(found);  
      },
      function (error) {
        deferred.reject(error);
      }
    );
  
    return deferred.promise;
};

/**
 * Defines event handlers for the tile life cycle events
 */
exports.eventHandlers = [

    // process tile instance whenever a new one is registered with the service
    {
        'event' : jive.constants.globalEventNames.NEW_INSTANCE,
        'handler' : processAddTileInstance
    },

    // process tile instance whenever an existing tile instance is updated
    {
        'event' : jive.constants.globalEventNames.INSTANCE_UPDATED,
        'handler' : processAddTileInstance
    },
  
    // process tile instance whenever an existing tile instance is updated
    {
        'event' : jive.constants.globalEventNames.INSTANCE_REMOVED,
        'handler' : processRemoveTileInstance
    }
  
];