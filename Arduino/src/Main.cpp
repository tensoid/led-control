#include <lc.hpp>

void setup() {

  // turn built-in led off
  pinMode(2, OUTPUT);
  digitalWrite(2, HIGH);  

  Serial.begin(9600);
	Serial.setDebugOutput(false);

  FastLED.addLeds<WS2812B, LED_DATA_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);

  Wifi::Connect(SSID, PASSWORD);
  Socket::Connect();
}
 
void loop() {
  
  Socket::update();
}