const unsavedChangesElement = document.querySelector("#unsaved-changes");

var socket = io();

/*
ws.onmessage = (msg) => {
  msg = JSON.parse(msg.data);
  if(msg.error) alert(msg.error);
}
*/

const API = {
  
  brightness(brightness){
    let urlParams = new URLSearchParams(window.location.search);
    let client = urlParams.get('id');
  
    socket.emit("brightness", JSON.stringify({
      body: {
        clients: [client],
        brightness
      }
    }), (result) => {
      result = JSON.parse(result);
      if(result.error) alert(result.error);
    });
  },
  
  
  profile(body, callback = null){

    if(callback == null) callback = (result) => {
      result = JSON.parse(result);
      if(result.error) alert(result.error);
    }
    
    let urlParams = new URLSearchParams(window.location.search);
    let client = urlParams.get('id');

    body.clients = [client];
  
    socket.emit("profile", JSON.stringify({body}), callback);
  }
};

