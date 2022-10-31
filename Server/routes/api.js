var express = require('express');
const { listen, set } = require('express/lib/application');
var router = express.Router();
var config = require('../data/DataManager');




router.post('/led/profile', function(req, res, next) {

  // Get Params
  let action = req.body.action;
  let profileName = req.body.profileName;
  let clients = req.body.clients;
  let profile = req.body.profile;
  
  
  // If Params are missing return error
  if(action == undefined) 
    return res.json({error: "No action defined in query. Valid actions are: load, load-custom, delete, add, alter, info, list"});

  if(profileName == undefined && (action != "list" && action != "load-custom")) 
    return res.json({error: "No profile name defined in query."});

  if(clients == undefined && (action == "load" || action == "load-custom")) 
    return res.json({error:  "No clients defined in query."});

  if(profile == undefined && (action == "alter" || action == "create" || action == "load-custom"))
    return res.json({error:  "No profile defined in query."});
  

  let result;

  switch(action){
    case "load":
      result = config.setClientsProfile(clients, profileName);
      return res.json(result);

    case "load-custom":
      result = config.setClientsCustomProfile(clients, profile);
      return res.json(result);

    case "delete":
      result = config.deleteProfile(profileName);
      return res.json(result);

    case "create":
      result = config.createProfile(profileName, profile);
      return res.json(result);

    case "alter":
      result = config.alterProfile(profileName, profile);
      return res.json(result);

    case "info":
      result = config.getProfileInfo(profileName);
      return res.json(result);

    case "list":
      result = config.getProfiles();
      return res.json(result);

    default:
      return res.json({error: "Unknown action. Valid actions are: load, load-custom, delete, add, alter, info, list"});
  }
});


router.post('/led/clients', function(req, res, next) {
  
  let client = req.body.client;
  let action = req.body.action;

  if(action == undefined) 
    return res.json({error: "No action defined in query. Valid actions are: list, info"});

  if(client == undefined && action == "info")
    return res.json({error: "No client defined in query."});

  if(typeof client != "string" && action == "info")
    return res.json({error: "Client must be a string."});


  let result;

  switch(action){
    case "list":
      result = config.getClients();
      return res.json(result);

    case "info":
      result = config.getClientConfig(client);
      return res.json(result);

    default:
      return res.json({error: "Unknown action. Valid actions are: list, info"});
  }
});


router.post('/led/alter-clients-profile', function(req, res, next) {
  let clients = req.body.clients;
  let property = req.body.property;
  let newValue = req.body.newValue;


  if(clients == undefined) 
    return res.json({error: "No clients defined in query"});

  if(property == undefined) 
    return res.json({error: "No property defined in query"});

  if(newValue == undefined) 
    return res.json({error: "No new value defined in query"});


  let result = config.alterClientsProfile(clients, property, newValue);
  return res.json(result);
});

//TODO: useless?
router.post('/led/status', function(req, res, next) {
  
  let clients = req.body.clients;
  let status = req.body.status;


  if(clients == undefined || clients.length == 0)
    return res.json({error: "No clients defined in body"});

  if(status == undefined)
    return res.json({error: "No status defined in body"});

  let result = config.setClientsStatus(clients, status);

  return res.json(result);
});


router.post('/led/mode', function(req, res, next) {

  let clients = req.body.clients;
  let mode = req.body.mode;
  let action = req.body.action;

  if((clients == undefined || clients.length == 0) && action != "list")
    return res.json({error: "No clients defined in query"});

  if(action == undefined)
    return res.json({error: "No action defined in query. Valid actions are: list, set"});

  if(mode == undefined && action == "set")
    return res.json({error: "No mode defined in query"});

  let possibleModes = config.getModes();

  // action: list
  if(action == "list") return res.json(possibleModes);

  // action: set
  if(!possibleModes.includes(mode))
    return res.json({error: "Invalid mode. Valid modes are: " + possibleModes.join(", ")});

  let result = config.alterClientsProfile(clients, "mode", mode);

  return res.json(result);
});






module.exports = router;
