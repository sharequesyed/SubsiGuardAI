#include <Arduino.h>
#include <U8g2lib.h>
#include <math.h>

// =====================================================
// SUBSIGUARD — SIH 2026 WIRELESS SENSOR NODE FIRMWARE
// Ground Subsidence Monitoring Prototype
// =====================================================

// Pinout definitions
const uint8_t OLED_SCK = 15;      // D8
const uint8_t OLED_SDA = 0;       // D3
const uint8_t OLED_DC  = 1;       // TX

const uint8_t OLED_RESET = 12;    // D6

const uint8_t RED_LED   = 4;      // D2
const uint8_t GREEN_LED = 5;      // D1
const uint8_t BUZZER    = 14;     // D5

const uint8_t RELAY1 = 16;        // D0
const uint8_t RELAY2 = 2;         // D4

// Active low relay logic
const uint8_t RELAY_OFF = HIGH;

// OLED display configuration
U8G2_SH1106_128X64_NONAME_F_4W_SW_SPI display(
  U8G2_R0,
  OLED_SCK,
  OLED_SDA,
  U8X8_PIN_NONE,
  OLED_DC,
  U8X8_PIN_NONE
);

// =====================================================
// DEMO STATES
// =====================================================

enum RiskState {
  SAFE_STATE,
  WARNING_STATE,
  CRITICAL_STATE
};

RiskState state = SAFE_STATE;

unsigned long stateStarted = 0;
unsigned long lastDisplay = 0;

// State transition intervals
const unsigned long SAFE_TIME     = 12000;  // 12 sec
const unsigned long WARNING_TIME  = 12000;  // 12 sec
const unsigned long CRITICAL_TIME = 12000;  // 12 sec

// Displayed simulated parameters
float tiltValue   = 0;
float vibration   = 0;
float crackWidth  = 0;
float strainValue = 0;


// =====================================================
// HELPERS
// =====================================================

void centeredText(uint8_t y, const char* text) {
  int width = display.getStrWidth(text);
  display.drawStr((128 - width) / 2, y, text);
}


float smoothNoise(float amplitude) {
  // Smooth changing value instead of random jumping
  return sin(millis() / 700.0) * amplitude;
}


// =====================================================
// BOOT SCREEN
// =====================================================

void bootScreen() {

  display.clearBuffer();

  display.setFont(u8g2_font_7x14B_tr);
  centeredText(19, "SUBSIGUARD");

  display.setFont(u8g2_font_6x10_tr);
  centeredText(36, "Mine Monitoring Node");
  centeredText(49, "NODE N01");

  display.setFont(u8g2_font_5x7_tr);
  centeredText(62, "INITIALIZING...");

  display.sendBuffer();

  // Two short boot beeps
  digitalWrite(GREEN_LED, HIGH);

  digitalWrite(BUZZER, HIGH);
  delay(120);
  digitalWrite(BUZZER, LOW);

  delay(180);

  digitalWrite(BUZZER, HIGH);
  delay(120);
  digitalWrite(BUZZER, LOW);

  delay(1600);
}


// =====================================================
// VALUE GENERATION
// =====================================================

void updateValues() {

  switch (state) {

    case SAFE_STATE:

      tiltValue =
        0.18 + smoothNoise(0.035);

      vibration =
        0.022 + smoothNoise(0.004);

      crackWidth =
        0.32 + smoothNoise(0.025);

      strainValue =
        0.44 + smoothNoise(0.035);

      break;


    case WARNING_STATE:

      tiltValue =
        0.44 + smoothNoise(0.055);

      vibration =
        0.082 + smoothNoise(0.010);

      crackWidth =
        1.48 + smoothNoise(0.09);

      strainValue =
        1.72 + smoothNoise(0.11);

      break;


    case CRITICAL_STATE:

      tiltValue =
        0.86 + smoothNoise(0.075);

      vibration =
        0.168 + smoothNoise(0.016);

      crackWidth =
        3.65 + smoothNoise(0.16);

      strainValue =
        3.12 + smoothNoise(0.18);

      break;
  }
}


// =====================================================
// INDICATORS
// =====================================================

void updateIndicators() {

  unsigned long now = millis();

  switch (state) {

    // ---------------- SAFE ----------------
    case SAFE_STATE:

      digitalWrite(GREEN_LED, HIGH);
      digitalWrite(RED_LED, LOW);
      digitalWrite(BUZZER, LOW);

      break;


    // ---------------- WARNING ----------------
    case WARNING_STATE:

      digitalWrite(GREEN_LED, LOW);

      // Slow red blink
      digitalWrite(
        RED_LED,
        (now % 1000 < 500) ? HIGH : LOW
      );

      // Short warning chirp
      digitalWrite(
        BUZZER,
        (now % 2000 < 100) ? HIGH : LOW
      );

      break;


    // ---------------- CRITICAL ----------------
    case CRITICAL_STATE:

      digitalWrite(GREEN_LED, LOW);

      // Fast red flash
      digitalWrite(
        RED_LED,
        (now % 300 < 150) ? HIGH : LOW
      );

      // Emergency alarm pattern
      digitalWrite(
        BUZZER,
        (now % 700 < 250) ? HIGH : LOW
      );

      break;
  }
}


// =====================================================
// OLED
// =====================================================

void drawDashboard() {

  display.clearBuffer();

  char text[30];

  // ---------- HEADER ----------

  display.setFont(u8g2_font_6x10_tr);

  display.drawStr(0, 9, "SUBSIGUARD");
  display.drawStr(94, 9, "N01");

  display.drawHLine(0, 12, 128);


  // ---------- SENSOR VALUES ----------

  display.setFont(u8g2_font_5x7_tr);

  snprintf(
    text,
    sizeof(text),
    "TILT    %.2f deg",
    tiltValue
  );
  display.drawStr(2, 23, text);


  snprintf(
    text,
    sizeof(text),
    "VIB     %.3f g",
    vibration
  );
  display.drawStr(2, 32, text);


  snprintf(
    text,
    sizeof(text),
    "CRACK   %.2f mm",
    crackWidth
  );
  display.drawStr(2, 41, text);


  snprintf(
    text,
    sizeof(text),
    "STRAIN  %.2f mm/m",
    strainValue
  );
  display.drawStr(2, 50, text);


  // ---------- STATUS ----------

  display.drawHLine(0, 53, 128);

  display.setFont(u8g2_font_6x13B_tr);


  if (state == SAFE_STATE) {

    centeredText(63, "STATUS: SAFE");

  }

  else if (state == WARNING_STATE) {

    centeredText(63, "! WARNING !");

  }

  else {

    centeredText(63, "!! CRITICAL !!");

  }


  display.sendBuffer();
}


// =====================================================
// STATE TRANSITIONS
// =====================================================

void updateState() {

  unsigned long elapsed =
    millis() - stateStarted;


  if (
    state == SAFE_STATE &&
    elapsed >= SAFE_TIME
  ) {

    state = WARNING_STATE;
    stateStarted = millis();

  }


  else if (
    state == WARNING_STATE &&
    elapsed >= WARNING_TIME
  ) {

    state = CRITICAL_STATE;
    stateStarted = millis();

  }


  else if (
    state == CRITICAL_STATE &&
    elapsed >= CRITICAL_TIME
  ) {

    state = SAFE_STATE;
    stateStarted = millis();

  }
}


// =====================================================
// SETUP
// =====================================================

void setup() {

  // -------------------------------------------------
  // IMPORTANT:
  // Force BOTH relays OFF before setting OUTPUT mode.
  // Pumps must NEVER activate during this demo.
  // -------------------------------------------------

  digitalWrite(RELAY1, RELAY_OFF);
  digitalWrite(RELAY2, RELAY_OFF);

  pinMode(RELAY1, OUTPUT);
  pinMode(RELAY2, OUTPUT);

  digitalWrite(RELAY1, RELAY_OFF);
  digitalWrite(RELAY2, RELAY_OFF);


  // LEDs + buzzer

  digitalWrite(RED_LED, LOW);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(BUZZER, LOW);

  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(BUZZER, OUTPUT);


  // OLED hardware reset pulse
  digitalWrite(OLED_RESET, LOW);
  pinMode(OLED_RESET, OUTPUT);

  delay(50);

  digitalWrite(OLED_RESET, HIGH);

  delay(200);


  // Start OLED

  display.begin();
  display.setContrast(200);


  // Boot animation

  bootScreen();


  state = SAFE_STATE;
  stateStarted = millis();
}


// =====================================================
// LOOP
// =====================================================

void loop() {

  // Maintain standby relay state
  digitalWrite(RELAY1, RELAY_OFF);
  digitalWrite(RELAY2, RELAY_OFF);

  updateState();
  updateValues();
  updateIndicators();


  // ~12 FPS OLED refresh
  if (millis() - lastDisplay >= 80) {

    lastDisplay = millis();
    drawDashboard();

  }


  delay(1);
}