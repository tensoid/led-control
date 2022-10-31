#include <lc.hpp>

namespace Wifi {    

  ESP8266WiFiMulti WifiMulti;


  void Connect(const char* ssid, const char* password){
    WifiMulti.addAP(ssid, password);
    Serial.print("Connecting to WIFI");
    while(WifiMulti.run() != WL_CONNECTED) {
      Serial.print(".");
      delay(200);
    }
    Serial.println("    Done!");  
  }
};
