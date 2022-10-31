(() => {

  function map(n, start1, stop1, start2, stop2) {
    return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
  };

  Object.defineProperty(Array.prototype, 'sum', {
    value: function() { return this.reduce((partial_sum, a) => partial_sum + a);}
  });

  var render = document.querySelector('canvas');
  var ctx = render.getContext('2d');

  // render rect
  var rect = (x, y, w, h, col = [255,255,255]) => {
    ctx.beginPath();
    ctx.rect(x, y, w, h);

    ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`;
    ctx.fill();
  };


  window.addEventListener("resize", UpdateSizes);

  // Run first-launch code
  UpdateSizes();

  // start socket connection
  var connection = SocketClient(3000);
  connection.onData(d => DrawFrame(d));
  connection.onError(console.log);
  connection.onClose(() => DrawFrame([]));
  connection.onReady(() => connection.send(JSON.stringify({type: "auth", id: "client-visualizer", leds: 100})));
  
  // first frame
  DrawLoading();

  // make connection public
  window.socket = connection;

  function DrawFrame(data) {

    data = data.data;

    // clear previous frame
    ctx.clearRect(0, 0, render.width, render.height);

    // calculate bar sizes
    var barWidth = render.width / data.length;
    var barHeight = render.height / 2;

    let l = 0.4;

    let left = data.splice(0, data.length / 2);
    let right = data;


    // draw left channel
    for (var i = 0; i < left.length; i++) {
      var height = l * barHeight; // left[i] * barH...
      var x = i * barWidth;
      var y = (render.height / 2) + (height / 2);
      rect(x, y, barWidth, -height, left[i]); 
    }

    // draw right channel
    for (var i = 0; i < right.length; i++) { 
      var height = l * barHeight;
      var x = i * barWidth + (render.width / 2);
      var y = (render.height / 2) + (height / 2);
      rect(x, y, barWidth, -height, right[i]); 
    }

    //rect(render.width / 2, 0, 1, render.height, [255, 255, 255]);
  };

  /**
   * Update Sizes
   */
  function UpdateSizes() {
    var width = document.documentElement.clientWidth;
    var height = document.documentElement.clientHeight;

    var render = document.querySelector('canvas');

    render.setAttribute("width", width);
    render.setAttribute("height", height);
  }

  /**
   * Socket Client
   */
  function SocketClient(port, ip = '127.0.0.1', reconnect = 500) {
    let state = false;
    let socket;
    
    let registerCallbacks = () => {
      state: state,

      // redirect events
      socket.onopen = () => callbacks.ready.forEach(c => c());
      socket.onmessage = (m) => callbacks.data.forEach(c => c(JSON.parse(m.data)));
      socket.onerror = (e) => callbacks.error.forEach(c => c(e));
      socket.onclose = () => {
        callbacks.close.forEach(c => c());

        // try to reconnect if connection gets closed
        setTimeout(connect, reconnect);
      };
    };

    
    // reconnect if the connection takes too long
    function connect() {
      if (state) return;
      socket = new WebSocket(`ws://${ip}:${port}`);
      registerCallbacks();

      setTimeout(connect, 2000);
    }

    let callbacks = {
      ready: [],
      data: [],
      close: [],
      error: []
    };

    callbacks.close.push(() => state = false);
    callbacks.ready.push(() => state = true);

    // connect on init
    connect();

    return {
      onData: (cb) => callbacks.data.push(cb),
      onReady: (cb) => callbacks.ready.push(cb),
      onClose: (cb) => callbacks.close.push(cb),
      onError: (cb) => callbacks.error.push(cb),
      send: (data) => socket.send(data)
    }
  }

  /**
   * Custom Script
   */
  function LoadCustomScript(enabled) {
    if (!enabled) return;

    let script = document.createElement("script");
    script.src = "custom.js";
    script.defer = true;
    script.type = "text/javascript";
    document.head.appendChild(script);
  }

  /**
   * Draw Loading Message
   */
  function DrawLoading() {
    if (connection.state) return;
  
    // get canvas
    var render = document.querySelector('canvas');
    var ctx = render.getContext('2d');
  
    // print text in buttom left corner
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Waiting for connection...", 5, render.height - 5);
  };
})();

