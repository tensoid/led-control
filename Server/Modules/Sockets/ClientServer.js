const WebSocket = require('ws');
const Reshaper = require("../AudioManipulation");
const config = require("../../data/DataManager");


class Server {

  constructor(httpServer) {

    // Config
    this.active = true;   
    this.clientConfigs = [];
    this.newConfigData = false;
    config.setUpdateCallback(() => this.newConfigData = true); 
    setInterval(this.updateStrips.bind(this), 16);

    // Sockets
    this.master;
    this.clients = [];

    // Audio Reshaper
    this.reshaper = new Reshaper(); 

    // WebSocketServer
    this.server = new WebSocket.WebSocketServer({ noServer: true });


    this.init();
  }

  init(){
    this.server.on("connection", (socket) => {
      socket.on("message", (data) => {
        
        data = JSON.parse(data);
      
        if (data.type == "auth") this.auth(socket, data);
        else if(data.type == "data") this.onData(socket, data);
      });
    });
  }


  auth(socket, data){
    if(data.id.startsWith("client")){

      // remove if duplicate
      let idx = this.clients.indexOf(this.clients.find(client => client.id == data.id));
      if(idx != -1) this.clients.splice(idx, 1);

      // add client to list
      socket.id = data.id.substring(7);

      socket.config = config.getClientConfig(socket.id);
      if(socket.config.error){
        config.createClientProfile(socket.id);
        socket.config = config.getClientConfig(socket.id);
      }

      socket.leds = data.leds;

      this.clients.push(socket);

      this.initStrip(socket, true);
    }

    else if(data.id.startsWith("master")){
      this.master = socket;
      this.master.id = data.id.substring(7);
    }

    console.log(`[${data.id.substring(0, 6).toUpperCase()}] ${data.id.substring(7)} connected`);
  }

  updateStrips(){
    if(!this.newConfigData) return;
    this.clients.forEach(client => {
      client.config = config.getClientConfig(client.id);
      this.initStrip(client, false);
    });

    this.newConfigData = false;
  }

  initStrip(client, initalConnect){

    //TODO: fix bug where first led is blue
    if(!client.config.active) {
      return client.send(JSON.stringify({
        type: "data",
        data: new Array(client.leds).fill([0,0,0])
      }));
    }

    if(client.config.profile.mode == "static"){
      let color = client.config.profile.static;
      client.send(JSON.stringify({
        type: "data",
        data: new Array(client.leds)
          .fill([color.r, color.g, color.b])
          .map(x => x
          .map(y => y * client.config.brightness / 100))
      }));
    }

    else if(client.config.profile.mode == "visualizer" && initalConnect){
      let color = client.config.profile.visualizer.baseColor;
      client.send(JSON.stringify({
        type: "data",
        data: new Array(client.leds)
          .fill([color.r, color.g, color.b])
          .map(x => x
          .map(y => y * client.config.brightness / 100))
      }));
    }
  }


  onData(socket, data){

    //if(data.id.startsWith("client")) this.clients.push({id: data.id, socket});
    if(data.id.startsWith("master")){
      let clients = this.clients.filter(client => client.config.profile.mode == "visualizer");
      
      clients.forEach(client => {
        let brightness = client.config.brightness;
        let profile = client.config.profile.visualizer;
        let processedData = this.reshaper.next(data.data, data.bassData, client.leds, profile, brightness);
        let json = {type: "data", data: processedData};
        client.send(JSON.stringify(json));
      });
    }
  }
}


module.exports = Server;