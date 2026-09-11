/**
 * SubsiGuard ESP32 Field Node Firmware (Instant-Compile Version)
 * Uses native Wire.h (No heavy Adafruit libraries = 2-second compile in Wokwi!)
 * Measures Ground Tilt (MPU-6050 I2C) & Crack Displacement (Potentiometer)
 * Publishes Live Telemetry to HiveMQ MQTT Cloud
 * Team MineNova6 - SIH 2026 Problem Statement 26025
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>

// Wokwi Simulated WiFi
const char* ssid = "Wokwi-GUEST";
const char* password = "";

// HiveMQ Public MQTT Broker
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_topic = "subsiguard/minenova6/telemetry";

// MPU-6050 I2C Address
const int MPU_ADDR = 0x68;

// Hardware Pins
#define POT_PIN 34        // Slide Potentiometer wiper (Crack Extensometer)
#define VIB_BUTTON_PIN 13 // Pushbutton (Simulates Dumper Vibration)
#define LED_TX_PIN 2      // Built-in Blue LED (Blinks on packet transmit)

WiFiClient espClient;
PubSubClient client(espClient);

unsigned long lastMsgTime = 0;
const int publishInterval = 600; // Telemetry interval in ms

void setupMPU6050() {
  Wire.begin(21, 22); // SDA = 21, SCL = 22
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x6B);   // PWR_MGMT_1 register
  Wire.write(0);      // Wake up MPU-6050
  Wire.endTransmission(true);
  Serial.println("MPU-6050 initialized via native I2C.");
}

void setupWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! IP: ");
  Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection to HiveMQ...");
    String clientId = "ESP32SubsiGuard-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      Serial.println(" Connected!");
    } else {
      Serial.print(" Failed rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 2s...");
      delay(2000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_TX_PIN, OUTPUT);
  pinMode(VIB_BUTTON_PIN, INPUT_PULLUP);

  setupMPU6050();
  setupWiFi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  unsigned long now = millis();
  if (now - lastMsgTime > publishInterval) {
    lastMsgTime = now;

    // 1. Read Raw Accelerometer from MPU-6050 registers (0x3B to 0x40)
    Wire.beginTransmission(MPU_ADDR);
    Wire.write(0x3B);
    Wire.endTransmission(false);
    Wire.requestFrom(MPU_ADDR, 6, true);

    int16_t rawX = (Wire.read() << 8) | Wire.read();
    int16_t rawY = (Wire.read() << 8) | Wire.read();
    int16_t rawZ = (Wire.read() << 8) | Wire.read();

    float ax = rawX / 16384.0;
    float ay = rawY / 16384.0;
    float az = rawZ / 16384.0;

    // Calculate ground tilt in degrees
    float tiltX = atan2(ay, sqrt(ax * ax + az * az)) * 180.0 / PI;
    float tiltY = atan2(-ax, az) * 180.0 / PI;
    tiltX = abs(tiltX);

    // Fallback if sensor not tilted
    if (isnan(tiltX) || tiltX < 0.01) tiltX = 0.04;

    // 2. Read Potentiometer for Crack Displacement (0 to 50 mm)
    int rawAdc = analogRead(POT_PIN);
    float crackMm = (rawAdc / 4095.0) * 50.0;
    float strainMmM = crackMm * 0.85;

    // 3. Read Vibration / Dumper Button (Active LOW)
    bool isVibrating = (digitalRead(VIB_BUTTON_PIN) == LOW);
    float vibG = isVibrating ? 0.65 : 0.025;
    int vibHz = isVibrating ? 85 : 8;

    // 4. Determine Statutory Severity (DGMS Threshold: 0.57 deg tilt)
    String status = "SAFE";
    if (tiltX > 0.57 || crackMm > 5.0) {
      status = "CRITICAL";
    } else if (tiltX > 0.25 || crackMm > 2.5) {
      status = "WARNING";
    }

    // 5. Construct JSON Payload
    String payload = "{";
    payload += "\"node\":\"N05\",";
    payload += "\"tilt\":" + String(tiltX, 2) + ",";
    payload += "\"crack\":" + String(crackMm, 2) + ",";
    payload += "\"strain\":" + String(strainMmM, 2) + ",";
    payload += "\"vib\":" + String(vibG, 3) + ",";
    payload += "\"vibHz\":" + String(vibHz) + ",";
    payload += "\"status\":\"" + status + "\"";
    payload += "}";

    // 6. Blink TX LED & Publish to MQTT
    digitalWrite(LED_TX_PIN, HIGH);
    client.publish(mqtt_topic, payload.c_str());
    Serial.println("MQTT Pub -> " + payload);
    delay(30);
    digitalWrite(LED_TX_PIN, LOW);
  }
}
