var jive = require('jive-sdk');

var tileServices = require('../services');

exports.getTargetsByPlace = {
  'path' : '/targets',
  'verb' : 'post',
  'route': function(req, res) {
      
    var jiveExtensionHeaders = jive.util.request.parseJiveExtensionHeaders(req);
//     if (!jiveExtensionHeaders ) {
//         res.writeHead(403, {'Content-Type': 'application/json'})
//         res.end( JSON.stringify( { } ) );
//         return;
//     } // end if
    
    var placeURI = req.body.placeURI;
    var userID = 4567; //TODO: INIT FROM HEADERS
          
    jive.logger.debug('Jive Extension Headers:',jiveExtensionHeaders);
    jive.logger.debug('Place URI:',placeURI);
    
    //TODO: VALIDATE EXTENSION HEADER & GLEAN USER ID

    //TODO: LOOKUP UP TILES IN PERSISTENCE AND THE SERIALIZE DETAILS TO STREAM
    if (!placeURI) {
      jive.logger.error('Invalid API Call: Requires Place Place URI in Body');
      res.writeHead(403, {'Content-Type': 'application/json'})
      res.end( JSON.stringify( { } ) );
    } else {    
      tileServices.verifyPlaceUser(placeURI,userID).then(
        function(authorized) {
          jive.logger.debug('Authorization Confirmed');
          tileServices.findTilesByPlaceID(placeURI).then(
            function(results) {
              res.writeHead(200, { 'Content-Type': 'application/json' });          
              res.end( JSON.stringify( results ) );    
            },
            function(error) {
              jive.logger.error('Error: ',error);
              res.writeHead(500, { 'Content-Type': 'application/json' });          
              res.end( JSON.stringify( { "error" : error } ) );                
            }
          );            
        },
        function (notAuthorized) {
          jive.logger.debug('Failed to Confirm Authorization!!!!');
          jive.logger.error('Error: ',error);
          res.writeHead(401, { 'Content-Type': 'application/json' });          
          res.end( JSON.stringify( { "error" : "Failed to Confirm Authorization!!!!" } ) );                
        }
      );
    } // end if
  } // end req,res function
};

exports.getAuthorizedUsersByPlace = {
  'path' : '/users',
  'verb' : 'post',
  'route': function(req, res) {
    var jiveExtensionHeaders = jive.util.request.parseJiveExtensionHeaders(req);
//     if (!jiveExtensionHeaders ) {
//         res.writeHead(403, {'Content-Type': 'application/json'})
//         res.end( JSON.stringify( { } ) );
//         return;
//     } // end if
    
    var placeURI = req.body.placeURI;
    var userID = 4567; //TODO: INIT FROM HEADERS

    jive.logger.debug('Jive Extension Headers:',jiveExtensionHeaders);
    jive.logger.debug('Place ID:',req.params.placeID);

  } // end req,res function
};

    