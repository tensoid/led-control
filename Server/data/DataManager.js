const fs = require('fs');
const { join } = require('path');
var config = require('./led-config');

//TODO: delete clients

let configChanged = false;

setInterval(() => {
  if(!configChanged) return;
  fs.writeFileSync(join(__dirname, "led-config.json"), JSON.stringify(config, null, 2));
  configChanged = false;
}, 1000);



function getPropertyByPath(obj, path){
  for (var i = 0, path = path.split('.'), len = path.length; i < len; i++){
    if(obj == undefined) return undefined;
    obj = obj[path[i]];
  }
  return obj;
}


function changeProperty(obj, path, newValue){
  
  if(getPropertyByPath(obj, path) == undefined) return `Property ${path} does not exist`;

  path = path.split('.');
  let evalString = "obj";
  for(let i = 0; i < path.length; i++){
    evalString += `["${path[i]}"]`;
  }
  evalString += ` = ${JSON.stringify(newValue)}`;
  
  eval(evalString);
}


function checkObjEqual(obj1,obj2){
  for(let key in obj1){

    if(!(key in obj2 )) return false;

    //if key has keys, check them
    if(obj1[key] instanceof Object && obj2[key] instanceof Object){
      if(!checkObjEqual(obj1[key],obj2[key])) return false;
    }

    //if key is not an object, check if there types are equal
    if(typeof obj1[key] !== typeof obj2[key]) return false;
  }
  return true;
}


function isValidProfile(profile){

  let defaultProfile = module.exports.getProfileInfo("default");

  return checkObjEqual(defaultProfile, profile);
}




module.exports = {

  /**
   * Gets called when the config updates.
   */
  updateCallback(){},


  /**
   * Gets called when the config updates.
   */
  setUpdateCallback(callback){
    this.updateCallback = callback;
  },


  /**
   * Gets the client names and current status.
   * @returns {Object}
   */
  getClients(){
    return config.currentProfiles.map(p => { return {client: p.client, active: p.active} });
  },

  
  /**
   * Gets all the existing profile names.
   * @returns {String[]}
   */
  getProfiles(){
    return config.profiles.map(p => p.name);
  },


  /**
   * Gets the profile information for the given profile name.
   * @param {String} profileName The name of the profile to get.
   * @returns {String} The Profile information
   */
  getProfileInfo(profileName){
    let profile = config.profiles.find(p => p.name == profileName);
    if(profile == undefined) return {error: `Profile ${profileName} does not exist`};
    return profile.profile;
  },


  /**
   * Gets the current profile for a client.
   * @param {String} client 
   * @returns {} The Profile info for the given client name.
   */
  getClientConfig(client){
    let clientConfig = config.currentProfiles.find(p => p.client === client);
    if(clientConfig === undefined) return {error: `Client ${client} does not exist`};
    
    let profile = this.getProfileInfo(clientConfig.profile);
    if(profile.error){
      clientConfig.profile = "default";
      configChanged = true;
      return this.getClientConfig(client);
    }

    profile.name = clientConfig.profile;

    clientConfig = JSON.parse(JSON.stringify(clientConfig));

    clientConfig.profile = profile;
    return clientConfig;
  },


  /**
   * Gets the current profile off all clients.
   * @returns {Object[]} The current Profiles off all clients.
   */
  getClientProfiles(){
    return config.currentProfiles.map(p => {
      return this.getProfileInfo(p.profile);;
    });
  },


  /**
   * Gets all the available modes.
   */
  getModes(){
    return config.modes;
  },


  /**
   * Adds a new client profile to the config.
   * @param {String} client 
   */
  createClientProfile(client){
    config.currentProfiles.push({client: client, active: true, profile: "default"});
    configChanged = true;
    return {success: true};
  },


  /**
   * Changes the brightness for clients.
   * @param {String[]} clients 
   * @param {Number} brightness 
   */
  setClientsBrightness(clients, brightness){

    for(let client of clients){
      let clientConfig = config.currentProfiles.find(p => p.client === client);
      if(clientConfig == undefined) return {error: `Client ${client} does not exist`};
      clientConfig.brightness = brightness;
    }

    configChanged = true;
    this.updateCallback();
    return {success: true};
  },

  
  /**
   * Turns a client on or off.
   * @param {String[]} clients 
   * @param {Boolean} status 
   */
  setClientsStatus(clients, status){
    
    for(let client of clients){
      let clientConfig = config.currentProfiles.find(p => p.client === client);
      if(clientConfig == undefined) return {error: `Client ${client} does not exist`};
      clientConfig.active = status;
    }

    configChanged = true;
    this.updateCallback();
    return {success: true};
  },


  setClientsProfile(clients, profileName){

    for(let client of clients){
      let clientConfig = config.currentProfiles.find(p => p.client === client);
      if(clientConfig == undefined) return {error: `Client ${client} does not exist`};
      clientConfig.profile = profileName;
    }

    configChanged = true;
    this.updateCallback();
    return {success: true};
  },


  /**
   * Creates a new profile.
   * @param {String} name Name of the profile to create.
   * @param {String[]} clients The clients this profile should be applied to.
   */
  createProfile(name, clients){
    //check if already exists
    let existing = config.profiles.find(p => p.name === name);
    if(existing) return `Profile ${name} already exists`;

    let defaultProfile = this.getProfileInfo("default");

    let profile = {
      name: name,
      profile: defaultProfile
    };

    config.profiles.push(profile);

    this.setClientsProfile(clients, name);
    
    configChanged = true;
    return {success: true};
  },


  /**
   * Deletes a profile.
   * @param {String} name The name of the profile to delete.
   */
  deleteProfile(name){

    if(name === "default") return {error: "Cannot delete default profile"};

    let exists = config.profiles.find(p => p.name === name);
    if(!exists) return {error: `Profile ${name} does not exist`};

    //set all client profiles that use this profile to default
    for(let client of config.currentProfiles){
      if(client.profile === name){
        client.profile = "default";
      }
    }

    config.profiles = config.profiles.filter(p => p.name !== name);

    configChanged = true;
    this.updateCallback();
    return {success: true};
  },


  /**
   * Alters a profile.
   * @param {String} name The name of the profile to alter.
   * @param {Object} profile The new Profile info.
   */
  setProfile(name, profile){

    let existing = config.profiles.find(p => p.name === name);
    if(existing == undefined) return {error: `Profile ${name} does not exist`};

    if(!isValidProfile(profile)) return {error: "Invalid profile structure"};

    config.profiles = config.profiles.filter(profile => profile.name !== name);

    config.profiles.push({name, profile});
    configChanged = true;
    this.updateCallback();
    return {success: true};
  },


  /**
   * Changes a property in the give profile.
   * @param {String} name The name of the profile to alter.
   * @param {} property 
   * @param {} newValue 
   */
   alterProfileProperty(profileName, property, newValue){
     
    let profile = this.getProfileInfo(profileName);

    if(profile.error) return profile.error;

    profile = JSON.parse(JSON.stringify(profile)); // copy object to not change original

    let result = changeProperty(profile, property, newValue);
    if(result != undefined) return {error: result};

    return this.setProfile(profileName, profile);
  },
}


