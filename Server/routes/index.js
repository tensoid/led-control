var express = require('express');
var router = express.Router();
var config = require('../data/DataManager');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Control Panel', data: { clients: config.getClients() } });
});


router.get('/client', function(req, res, next) {
  let client = req.query.id;

  //check if client exists
  let clientInfo = config.getClientConfig(client);

  if(clientInfo.error)
    return res.render('error', { layout: false,  message: clientInfo.error  });

  res.render('client', { title: 'Control Panel', data: { 
    clients: config.getClients(), 
    client: clientInfo, 
    modes: config.getModes(), 
    profiles: config.getProfiles()} 
  });
});


router.get('/v', function(req, res, next) {
  res.render('visualizer', { title: 'VISUALIZER' });
});


module.exports = router;
