#include <lc.hpp>

CRGB leds[NUM_LEDS];

namespace Socket {

  unsigned long lastDataTime = millis();

  WebSocketsClient webSocket;

  void auth(){
    DynamicJsonDocument auth(256);
    std::string auth_json;

    auth["type"] = "auth";
    auth["id"]   = String("client-") + String(ID);
    auth["leds"] = NUM_LEDS;
  
    serializeJson(auth, auth_json);
    
    webSocket.sendTXT(auth_json.c_str());
  }


  void handleData(const char* data){

    // Deserialize
    std::string rawJson(data);
    
    DynamicJsonDocument json(10000);
    deserializeJson(json, rawJson);


    if(json["type"] == "data"){

      for(int i = 0; i < NUM_LEDS; i++){
        leds[i] = CRGB(json["data"][i][0], json["data"][i][1], json["data"][i][2]);
      }

      FastLED.show();

      lastDataTime = millis();
    } 
  }


  void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {

    switch(type) {

      case WStype_DISCONNECTED:
        Serial.printf("[WS] Disconnected!\n");
        break;

      case WStype_CONNECTED: 
        Serial.printf("[WS] Connected!\n");
        auth();
        break;

      case WStype_TEXT:
        handleData((const char *) payload);
        break;
    }
  }
  
  
  void Connect(){
    webSocket.begin(IP, PORT, "/client");
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(RECONNECT_INTERVAL);
    webSocket.enableHeartbeat(15000, 3000, 2);
  }


  void update(){
    webSocket.loop();

    if(millis() - lastDataTime > LED_FAIL_CHECK_INTERVAL){
      FastLED.show(); 
      lastDataTime = millis();
    }
  }
}


