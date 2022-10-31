const config = require("../../data/DataManager");
const io = require('socket.io'); 

class Server {

  constructor(httpServer) {

    this.server = new io.Server(httpServer);

    this.init();
  }

  init(){
    this.server.on("connection", (socket) => {
      socket.on("alterProfileProperty", (data, callback) => this.alterProfileProperty(socket, JSON.parse(data), callback));
      socket.on("profile", (data, callback) => this.profile(socket, JSON.parse(data), callback));
      socket.on("brightness", (data, callback) => this.brightness(socket, JSON.parse(data), callback));
    });
  }

  
  //
  // API
  //

  profile(socket, data, callback){

    // Get Params
    let action = data.body.action;
    let profileName = data.body.profileName;
    let clients = data.body.clients;
    let property = data.body.property;
    let newValue = data.body.newValue;    
    
    
    // If Params are missing return error
    if(action == undefined) 
      return callback(JSON.stringify({error: "No action defined in query. Valid actions are: set, delete, add, alter, info, list"}));
  
    if(profileName == undefined && action != "list") 
      return callback(JSON.stringify({error: "No profile name defined in query."}));
  
    if(clients == undefined && action == "set") 
      return callback(JSON.stringify({error: "No clients defined in query."}));

    if(property == undefined && action == "alter")
      return callback(JSON.stringify({error:"No property defined in query."}));

    if(newValue == undefined && action == "alter")
      return callback(JSON.stringify({error:"No new value defined in query."}));
    
  
    let result;
  
    switch(action){

      case "set":
        result = config.setClientsProfile(clients, profileName);
        return callback(JSON.stringify(result));

      case "delete":
        result = config.deleteProfile(profileName);
        return callback(JSON.stringify(result));

      case "create":
        result = config.createProfile(profileName, clients ? clients : []);
        return callback(JSON.stringify(result));

      case "alter":
        result = config.alterProfileProperty(profileName, property, newValue);
        return callback(JSON.stringify(result));

      case "info":
        result = config.getProfileInfo(profileName);
        return callback(JSON.stringify(result));

      case "list":
        result = config.getProfiles();
        return callback(JSON.stringify(result));
  
      default:
        return callback(JSON.stringify({error: "Unknown action. Valid actions are: set, delete, add, alter, info, list"}));
    }
  }


  brightness(socket, data, callback){
      
      let clients = data.body.clients;
      let brightness = data.body.brightness;
  
      if(clients == undefined) 
        return callback(JSON.stringify({error: "No client defined in query"}));
  
      if(brightness == undefined) 
        return callback(JSON.stringify({error: "No brightness defined in query"}));
  
      let result = config.setClientsBrightness(clients, brightness);
      return callback(JSON.stringify(result));
  }
}


module.exports = Server;





