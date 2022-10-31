const Url = require('url');


module.exports = (httpServer) => {

  var clientServer = require("./ClientServer");
  clientServer = new clientServer();

  var configServer = require("./ConfigServer");
  configServer = new configServer(httpServer); // Runs with socket.io so needs http server

  httpServer.on('upgrade', function upgrade(request, socket, head) {
    
    const { pathname } = Url.parse(request.url);

    if (pathname === '/client') {
      clientServer.server.handleUpgrade(request, socket, head, function done(ws) {
        clientServer.server.emit('connection', ws, request);
      });
    } 
    /*
    else if (pathname === '/config') {
      configServer.server.handleUpgrade(request, socket, head, function done(ws) {
        configServer.server.emit('connection', ws, request);
      });
    } 
    */ 
    
    else socket.destroy();
  });
}


 