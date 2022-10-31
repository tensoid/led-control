/**
 * Handles all the api calls to the server
 */
const api = {
  fetch(endpoint, body, cb){
    fetch(`http://localhost:3000/api/led/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },  
  
    body: JSON.stringify(body)
  })
    .then(response => response.json())
    .then(data => cb(data));
  }
};

/**
 * Handles everything cookie related
 */
 const cookies = {
  get (cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  },
  
  
  set (cname, cvalue, exyears) {
    let d = new Date();
    d.setTime(d.getTime() + (exyears*24*60*60*1000*365));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
}


const color = {

  hexToRGB(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}