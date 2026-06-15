/* ================================================================
   SMART HOME IoT — WOKWI SIMULATION (Full Device Sync)
   ================================================================
   Subscribes to REAL per-device MQTT topics published by the backend.
   Each device has a unique topic: smart/home/appareil/{mongoId}
   Security devices use: smart/home/portes, alarme, capteur/{name}
   
   Backend payload formats (from appareilController.updateAppareil):
     ECLAIRAGE  : ON|OFF : intensity(0-100)
     CAMERA     : ON|OFF : REC|NO_REC
     THERMIQUE  : ON|OFF : CHAUD|FROID|AUTO : targetTemp
     MULTIMEDIA : ON|OFF : APP : volume : channel : PLAY|PAUSE
     MOTORISE   : ON|OFF : MODE : percentage
     ASPIRATEUR : ON|OFF : STANDARD|SILENCIEUX|TURBO
     PORTE      : ON|OFF : LOCKED|UNLOCKED
     SECURITE   : ON|OFF : ARMED|TRIGGERED
     CAPTEUR    : ON|OFF : MOUVEMENT|FUMEE|HUMIDITE : value
   ================================================================ */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHTesp.h>
#include <ESP32Servo.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ── WiFi (Wokwi built-in access point) ──
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const int wifiCh = 6;
const uint8_t wokwiBssid[] = {0x42,0x13,0x37,0x55,0xAA,0x01};
const char* mqttServer = "broker.emqx.io";

WiFiClient espClient;
PubSubClient mqtt(espClient);

// ================================================================
// DEVICE IDs (must match seed.js MongoDB ObjectIds exactly)
// ================================================================
#define NUM_DEVICES 7
struct DeviceEntry { const char* id; const char* name; };

const DeviceEntry DEVICES[NUM_DEVICES] = {
  { "6a0cf42e7264a021407dae9d", "ECLAIRAGE"  },  // Lumiere Principale
  { "6a0cf43a7264a021407dae9e", "CAMERA"     },  // Camera Entree
  { "6a0cf4487264a021407dae9f", "THERMIQUE"  },  // Climatiseur Samsung
  { "6a0e0999a05e12a54e87872b", "MULTIMEDIA" },  // Television Salon
  { "6a10d976513a833a7ea56ecf", "MOTORISE_1" },  // Rideau Salon 1
  { "6a10d99c513a833a7ea56ed0", "MOTORISE_2" },  // Rideau Salon 2
  { "6a10dc92513a833a7ea56ed1", "ASPIRATEUR" }   // Aspirateur Robot
};

// ================================================================
// PIN ASSIGNMENTS (must match diagram.json)
// ================================================================
// Salon device outputs
#define PIN_LIGHT       2    // Light LED (PWM)
#define PIN_CAM_PWR    16    // Camera power indicator
#define PIN_CAM_REC    17    // Camera recording indicator
#define PIN_AC_PWR     13    // AC power indicator
#define PIN_AC_FROID   12    // AC FROID mode indicator
#define PIN_AC_CHAUD   26    // AC CHAUD mode indicator
#define PIN_TV_R       27    // TV RGB red
#define PIN_TV_G       32    // TV RGB green
#define PIN_TV_B       33    // TV RGB blue
#define PIN_RIDEAU1     5    // Curtain 1 indicator
#define PIN_RIDEAU2    18    // Curtain 2 indicator
#define PIN_VAC_PWR    19    // Vacuum power indicator
#define PIN_VAC_STD    25    // Vacuum STANDARD mode indicator
// Security device outputs
#define PIN_SERVO       4    // Door lock servo
#define PIN_BUZZER     14    // Alarm buzzer
#define PIN_ALARM_LED  15    // Alarm LED
#define PIN_MOTION_LED  0    // Motion detected indicator
#define PIN_SMOKE_LED  23    // Smoke detected indicator (GPIO 35 is input-only!)
// Sensor inputs
#define PIN_MOTION_SW  36    // Slide switch (simulates PIR)
#define PIN_SMOKE_POT  39    // Potentiometer (simulates smoke)
#define PIN_BUTTON     34    // Manual override pushbutton
// DHT22 + I2C LCD
#define PIN_DHT        35    // DHT22 data (input-only pin OK for DHT protocol)

// PWM config for light (ESP32 v3.x LEDC API)
#define PWM_FREQ    5000
#define PWM_RES        8     // 0-255

// ================================================================
// DEVICE STATE
// ================================================================
struct {
  bool on; int brightness;
} lightSt = { false, 0 };

struct {
  bool on; bool rec;
} cameraSt = { false, false };

struct {
  bool on; char mode[8]; int targetTemp; int currentTemp;
} acSt = { false, "AUTO", 24, 22 };

struct {
  bool on; char app[10]; int volume; bool playing;
} tvSt = { false, "NONE", 20, true };

struct {
  bool on; int pct;
} rideau1St = { false, 0 }, rideau2St = { false, 0 };

struct {
  bool on; char mode[12];
} vacSt = { false, "STANDARD" };

struct {
  bool locked;
} doorSt = { true };

struct {
  bool armed; bool triggered;
} alarmSt = { false, false };

struct {
  bool motionOn; bool smokeOn;
} sensorSt = { false, false };

// Environmental sensors
float envTemp = 22.0, envHumid = 50.0;
int envSmoke = 0;
bool envMotion = false;

// ================================================================
// MQTT TOPICS (subscribed by this sketch)
// ================================================================
const char* TOPIC_PORTES  = "smart/home/portes";
const char* TOPIC_ALARME  = "smart/home/alarme";
const char* TOPIC_CAPTEUR_MVT  = "smart/home/capteur/mouvement";
const char* TOPIC_CAPTEUR_FUM  = "smart/home/capteur/fumee";
const char* TOPIC_COMMANDES    = "smart/home/appareils/commandes";

// ================================================================
// HARDWARE OBJECTS + TIMING
// ================================================================
DHTesp dht;
Servo doorServo;
LiquidCrystal_I2C lcd(0x27, 16, 2);

unsigned long lastSensor = 0, lastTelemetry = 0, lastWifiRetry = 0;
unsigned long lastMqttRetry = 0, lastBlink = 0;
bool blinkState = false;

const unsigned long SENSOR_INT = 3000;
const unsigned long TELEMETRY_INT = 10000;

// ================================================================
// DEVICE ID LOOKUP
// ================================================================
const char* findDeviceName(const char* topic) {
  for (int i = 0; i < NUM_DEVICES; i++) {
    if (strstr(topic, DEVICES[i].id)) return DEVICES[i].name;
  }
  return NULL;
}

// ================================================================
// TOKENIZER HELPER
// ================================================================
void tokenizePayload(const char* payload, char tokens[][20], int maxTok, int& count) {
  count = 0;
  char buf[128];
  strncpy(buf, payload, 127); buf[127] = '\0';
  int len = strlen(buf);
  while (len > 0 && (buf[len-1] == '\n' || buf[len-1] == '\r')) buf[--len] = '\0';

  char* p = strtok(buf, ":");
  while (p && count < maxTok) {
    strncpy(tokens[count], p, 19); tokens[count][19] = '\0';
    for (int i = 0; tokens[count][i]; i++) tokens[count][i] = toupper(tokens[count][i]);
    count++;
    p = strtok(NULL, ":");
  }
}

// ================================================================
// PER-DEVICE COMMAND HANDLERS
// ================================================================
void handleLight(const char* payload) {
  char tok[4][20]; int n;
  tokenizePayload(payload, tok, 4, n);
  if (n < 1) return;

  bool isOn = (strcmp(tok[0], "ON") == 0);
  int intensity = (n > 1) ? atoi(tok[1]) : 100;

  lightSt.on = isOn;
  lightSt.brightness = isOn ? map(intensity, 0, 100, 0, 255) : 0;
  ledcWrite(PIN_LIGHT, lightSt.brightness);
  Serial.printf("[LIGHT] %s intensity=%d%% bright=%d\n", isOn?"ON":"OFF", intensity, lightSt.brightness);
}

void handleCamera(const char* payload) {
  char tok[4][20]; int n;
  tokenizePayload(payload, tok, 4, n);
  if (n < 1) return;

  bool isOn = (strcmp(tok[0], "ON") == 0);
  bool isRec = (n > 1 && strcmp(tok[1], "REC") == 0);

  cameraSt.on = isOn;
  cameraSt.rec = isOn && isRec;
  digitalWrite(PIN_CAM_PWR, cameraSt.on);
  digitalWrite(PIN_CAM_REC, cameraSt.rec);
  Serial.printf("[CAMERA] %s %s\n", isOn?"ON":"OFF", cameraSt.rec?"REC":"");
}

void handleThermique(const char* payload) {
  char tok[4][20]; int n;
  tokenizePayload(payload, tok, 4, n);
  if (n < 1) return;

  bool isOn = (strcmp(tok[0], "ON") == 0);
  acSt.on = isOn;
  if (n > 1) { strncpy(acSt.mode, tok[1], 7); acSt.mode[7] = '\0'; }
  if (n > 2) acSt.targetTemp = atoi(tok[2]);
  acSt.currentTemp = (int)envTemp;

  digitalWrite(PIN_AC_PWR, isOn);
  bool froid = isOn && (strcmp(acSt.mode, "FROID") == 0);
  bool chaud = isOn && (strcmp(acSt.mode, "CHAUD") == 0);
  bool autoMode = isOn && (strcmp(acSt.mode, "AUTO") == 0);
  digitalWrite(PIN_AC_FROID, froid || (autoMode && envTemp > acSt.targetTemp));
  digitalWrite(PIN_AC_CHAUD, chaud || (autoMode && envTemp < acSt.targetTemp));
  Serial.printf("[AC] %s mode=%s target=%d°C\n", isOn?"ON":"OFF", acSt.mode, acSt.targetTemp);
}

void handleMultimedia(const char* payload) {
  char tok[6][20]; int n;
  tokenizePayload(payload, tok, 6, n);
  if (n < 1) return;

  bool isOn = (strcmp(tok[0], "ON") == 0);
  tvSt.on = isOn;
  if (n > 1) { strncpy(tvSt.app, tok[1], 9); tvSt.app[9] = '\0'; }
  if (n > 2) tvSt.volume = atoi(tok[2]);
  tvSt.playing = (n > 4 && strcmp(tok[4], "PLAY") == 0);

  // RGB shows app: RED=Netflix, GREEN=Spotify, BLUE=other/TV
  bool netflix = isOn && (strcmp(tvSt.app, "NETFLIX") == 0);
  bool spotify = isOn && (strcmp(tvSt.app, "SPOTIFY") == 0);
  bool other   = isOn && !netflix && !spotify;
  digitalWrite(PIN_TV_R, netflix);
  digitalWrite(PIN_TV_G, spotify);
  digitalWrite(PIN_TV_B, other);
  Serial.printf("[TV] %s app=%s vol=%d %s\n", isOn?"ON":"OFF", tvSt.app, tvSt.volume, tvSt.playing?"PLAY":"PAUSE");
}

void handleMotorise(const char* payload, bool isRideau2) {
  char tok[4][20]; int n;
  tokenizePayload(payload, tok, 4, n);
  if (n < 1) return;

  bool isOn = (strcmp(tok[0], "ON") == 0);
  int pct = 0;
  // Payload: ON:MODE:POURCENTAGE or ON:POURCENTAGE
  if (n > 2) pct = atoi(tok[2]);
  else if (n > 1) { int v = atoi(tok[1]); if (v > 0) pct = v; }

  if (isRideau2) {
    rideau2St.on = isOn; rideau2St.pct = pct;
    digitalWrite(PIN_RIDEAU2, isOn && pct > 0);
  } else {
    rideau1St.on = isOn; rideau1St.pct = pct;
    digitalWrite(PIN_RIDEAU1, isOn && pct > 0);
  }
  Serial.printf("[RIDEAU%d] %s pct=%d%%\n", isRideau2?2:1, isOn?"ON":"OFF", pct);
}

void handleAspirateur(const char* payload) {
  char tok[4][20]; int n;
  tokenizePayload(payload, tok, 4, n);
  if (n < 1) return;

  bool isOn = (strcmp(tok[0], "ON") == 0);
  vacSt.on = isOn;
  if (n > 1) { strncpy(vacSt.mode, tok[1], 11); vacSt.mode[11] = '\0'; }

  digitalWrite(PIN_VAC_PWR, isOn);
  digitalWrite(PIN_VAC_STD, isOn && strcmp(vacSt.mode, "STANDARD") == 0);
  Serial.printf("[VACUUM] %s mode=%s\n", isOn?"ON":"OFF", vacSt.mode);
}

void handlePorte(const char* payload) {
  char tok[4][20]; int n;
  tokenizePayload(payload, tok, 4, n);
  if (n < 1) return;

  // Payload: ON|OFF:LOCKED|UNLOCKED or LOCK:NAME|UNLOCK:NAME
  if (strcmp(tok[0], "LOCK") == 0 || strcmp(tok[0], "UNLOCK") == 0) {
    doorSt.locked = (strcmp(tok[0], "LOCK") == 0);
  } else {
    if (n > 1) doorSt.locked = (strcmp(tok[1], "LOCKED") == 0);
  }
  doorServo.write(doorSt.locked ? 0 : 90);
  Serial.printf("[DOOR] %s\n", doorSt.locked ? "LOCKED" : "UNLOCKED");
}

void handleAlarm(const char* payload) {
  char msg[20];
  strncpy(msg, payload, 19); msg[19] = '\0';
  for (int i = 0; msg[i]; i++) msg[i] = toupper(msg[i]);

  alarmSt.armed = (strcmp(msg, "ON") == 0);
  if (!alarmSt.armed) alarmSt.triggered = false;
  Serial.printf("[ALARM] %s\n", alarmSt.armed ? "ARMED" : "DISARMED");
}

void handleCapteur(const char* payload, bool isMotion) {
  char msg[20];
  strncpy(msg, payload, 19); msg[19] = '\0';
  for (int i = 0; msg[i]; i++) msg[i] = toupper(msg[i]);

  bool active = (strcmp(msg, "ON") == 0);
  if (isMotion) {
    sensorSt.motionOn = active;
    digitalWrite(PIN_MOTION_LED, active);
  } else {
    sensorSt.smokeOn = active;
    digitalWrite(PIN_SMOKE_LED, active);
  }
  Serial.printf("[SENSOR %s] %s\n", isMotion ? "MOTION" : "SMOKE", active ? "ON" : "OFF");
}

// ================================================================
// MAIN MQTT CALLBACK — Dispatches to device handlers
// ================================================================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  char msg[128];
  int len = (length > 127) ? 127 : length;
  memcpy(msg, payload, len);
  msg[len] = '\0';

  Serial.printf("[MQTT] %s >> %s\n", topic, msg);

  // 1. Per-device topic: smart/home/appareil/{deviceId}
  const char* devName = findDeviceName(topic);
  if (devName) {
    if (strcmp(devName, "ECLAIRAGE") == 0)  handleLight(msg);
    else if (strcmp(devName, "CAMERA") == 0)     handleCamera(msg);
    else if (strcmp(devName, "THERMIQUE") == 0)  handleThermique(msg);
    else if (strcmp(devName, "MULTIMEDIA") == 0)  handleMultimedia(msg);
    else if (strcmp(devName, "MOTORISE_1") == 0)  handleMotorise(msg, false);
    else if (strcmp(devName, "MOTORISE_2") == 0)  handleMotorise(msg, true);
    else if (strcmp(devName, "ASPIRATEUR") == 0)  handleAspirateur(msg);
    return;
  }

  // 2. Security topics
  if (strstr(topic, "portes"))   { handlePorte(msg); return; }
  if (strstr(topic, "alarme"))   { handleAlarm(msg); return; }
  if (strstr(topic, "capteur/mouvement")) { handleCapteur(msg, true); return; }
  if (strstr(topic, "capteur/fumee"))     { handleCapteur(msg, false); return; }

  Serial.println("[MQTT] No handler for this topic");
}

// ================================================================
// WiFi & MQTT CONNECTION
// ================================================================
void connectWifi(bool retry) {
  if (WiFi.status() == WL_CONNECTED) return;
  Serial.println("[WiFi] Connecting...");
  WiFi.mode(WIFI_STA);
  if (retry) { WiFi.disconnect(true); delay(200); }
  WiFi.begin(ssid, password, wifiCh, wokwiBssid);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(100); Serial.print(".");
    if (millis() - start > 20000) {
      Serial.println("\n[WiFi] Failed. Scan:");
      int n = WiFi.scanNetworks();
      for (int i = 0; i < n; i++)
        Serial.printf("  %s (RSSI %d)\n", WiFi.SSID(i).c_str(), WiFi.RSSI(i));
      return;
    }
  }
  Serial.printf("\n[WiFi] Connected — IP: %s\n", WiFi.localIP().toString().c_str());
}

void connectMQTT() {
  if (mqtt.connected() || WiFi.status() != WL_CONNECTED) return;
  Serial.println("[MQTT] Connecting...");

  char clientId[30];
  snprintf(clientId, sizeof(clientId), "SmartHomeWokwi_%04X", random(0xFFFF));
  espClient.setTimeout(10);

  if (mqtt.connect(clientId)) {
    Serial.println("[MQTT] Connected! Subscribing to all topics...");

    // Subscribe to per-device topics (7 devices)
    for (int i = 0; i < NUM_DEVICES; i++) {
      char topic[80];
      snprintf(topic, sizeof(topic), "smart/home/appareil/%s", DEVICES[i].id);
      mqtt.subscribe(topic);
      Serial.printf("  + %s (%s)\n", DEVICES[i].name, topic);
    }

    // Subscribe to security topics
    mqtt.subscribe(TOPIC_PORTES);
    mqtt.subscribe(TOPIC_ALARME);
    mqtt.subscribe(TOPIC_CAPTEUR_MVT);
    mqtt.subscribe(TOPIC_CAPTEUR_FUM);
    mqtt.subscribe(TOPIC_COMMANDES);
    Serial.println("  + Security topics (portes, alarme, capteurs)");

    lcd.clear();
    lcd.setCursor(0, 0); lcd.print("MQTT Connected!");
    lcd.setCursor(0, 1); lcd.print(WiFi.localIP().toString().c_str());
    // NOTE: No blocking delay here — delay would prevent mqtt.loop() from
    // running, causing the broker to drop the connection (missed PINGREQ).
  } else {
    Serial.printf("[MQTT] Failed, code: %d\n", mqtt.state());
  }
}

// ================================================================
// SENSOR READING (DHT22 + simulated inputs)
// ================================================================
void readSensors() {
  TempAndHumidity data = dht.getTempAndHumidity();
  if (!isnan(data.temperature) && !isnan(data.humidity)) {
    envTemp = data.temperature;
    envHumid = data.humidity;
  }
  envSmoke = map(analogRead(PIN_SMOKE_POT), 0, 4095, 0, 100);
  envMotion = digitalRead(PIN_MOTION_SW) == HIGH;
}

// ================================================================
// TELEMETRY PUBLISHING
// ================================================================
void publishTelemetry() {
  char payload[350];
  snprintf(payload, sizeof(payload),
    "{\"temp\":%.1f,\"humid\":%.0f,\"smoke\":%d,\"motion\":%s,"
    "\"light\":%s,\"cam\":%s,\"ac\":%s,\"acMode\":\"%s\",\"acTarget\":%d,"
    "\"tv\":%s,\"tvApp\":\"%s\",\"rideau1\":%d,\"rideau2\":%d,"
    "\"vacuum\":%s,\"vacMode\":\"%s\",\"door\":\"%s\","
    "\"alarm\":%s,\"alarmTriggered\":%s}",
    envTemp, envHumid, envSmoke, envMotion ? "true" : "false",
    lightSt.on ? "true" : "false",
    cameraSt.on ? "true" : "false",
    acSt.on ? "true" : "false", acSt.mode, acSt.targetTemp,
    tvSt.on ? "true" : "false", tvSt.app,
    rideau1St.pct, rideau2St.pct,
    vacSt.on ? "true" : "false", vacSt.mode,
    doorSt.locked ? "locked" : "unlocked",
    alarmSt.armed ? "armed" : "disarmed",
    alarmSt.triggered ? "true" : "false");

  if (mqtt.connected())
    mqtt.publish("smart/home/appareils/telemetrie", payload);

  Serial.printf("[TELEMETRY] %s\n", payload);

  // Update LCD with status
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("T:"); lcd.print(envTemp, 1); lcd.print("C");
  lcd.print(" H:"); lcd.print(envHumid, 0); lcd.print("%");
  lcd.setCursor(0, 1);
  if (alarmSt.triggered) lcd.print("!ALARM!");
  else if (alarmSt.armed) lcd.print("ARMED");
  else lcd.print("SAFE");
  lcd.print(" D:"); lcd.print(doorSt.locked ? "LCK" : "OPN");
}

// ================================================================
// SETUP
// ================================================================
void setup() {
  Serial.begin(115200);
  delay(200);

  connectWifi(false);

  // LCD
  Wire.begin(21, 22);
  lcd.init();
  delay(100);
  lcd.backlight();
  lcd.clear();
  lcd.print("SMART HOME v3.0");
  lcd.setCursor(0, 1);
  lcd.print("Full Device Sync");
  delay(500);

  // DHT22
  dht.setup(PIN_DHT, DHTesp::DHT22);
  delay(1000);

  // Output pins (all LOW)
  int outPins[] = { PIN_CAM_PWR, PIN_CAM_REC, PIN_AC_PWR, PIN_AC_FROID,
    PIN_AC_CHAUD, PIN_TV_R, PIN_TV_G, PIN_TV_B, PIN_RIDEAU1, PIN_RIDEAU2,
    PIN_VAC_PWR, PIN_VAC_STD, PIN_ALARM_LED, PIN_MOTION_LED, PIN_SMOKE_LED };
  for (int i = 0; i < 15; i++) {
    pinMode(outPins[i], OUTPUT);
    digitalWrite(outPins[i], LOW);
  }

  // Light via PWM (ESP32 v3.x LEDC)
  ledcAttach(PIN_LIGHT, PWM_FREQ, PWM_RES);
  ledcWrite(PIN_LIGHT, 0);

  // Input pins
  pinMode(PIN_MOTION_SW, INPUT);       // slide switch (PIR sim)
  pinMode(PIN_SMOKE_POT, INPUT);       // potentiometer (smoke sim)
  pinMode(PIN_BUTTON, INPUT_PULLUP);   // pushbutton

  // Servo (door lock) — default LOCKED
  doorServo.attach(PIN_SERVO);
  delay(100);
  doorServo.write(0);
  delay(500);

  // MQTT config
  mqtt.setServer(mqttServer, 1883);
  mqtt.setCallback(mqttCallback);
  mqtt.setKeepAlive(30);
  mqtt.setSocketTimeout(10);

  readSensors();

  lcd.clear();
  lcd.print("System Ready!");
  delay(1000);

  Serial.println("\n========================================");
  Serial.println(" SMART HOME v3.0 — Full Device Sync");
  Serial.println(" All 7 salon devices + security devices");
  Serial.println(" Subscribed to real per-device MQTT topics");
  Serial.println("========================================\n");
}

// ================================================================
// MAIN LOOP
// ================================================================
void loop() {
  // WiFi reconnection
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() - lastWifiRetry > 10000) {
      lastWifiRetry = millis();
      connectWifi(true);
    }
  }

  // MQTT reconnection + message processing
  if (!mqtt.connected()) {
    if (millis() - lastMqttRetry > 5000) {
      lastMqttRetry = millis();
      connectMQTT();
    }
  } else {
    mqtt.loop();
  }

  // Manual override button (with 5s startup guard + 2s debounce)
  static unsigned long lastBtnTime = 0;
  const unsigned long BTN_DEBOUNCE = 2000;  // 2 seconds between presses
  const unsigned long STARTUP_GUARD = 5000;  // ignore button for 5s after boot
  if (millis() > STARTUP_GUARD &&
      digitalRead(PIN_BUTTON) == LOW &&
      (millis() - lastBtnTime > BTN_DEBOUNCE)) {
    lastBtnTime = millis();
    static int btnCycle = 0;
    btnCycle = (btnCycle + 1) % 3;
    Serial.printf("[BUTTON] Cycle %d: ", btnCycle);

    if (btnCycle == 0) {
      // Default: everything off, door locked
      lightSt.on = false; ledcWrite(PIN_LIGHT, 0);
      cameraSt.on = false; digitalWrite(PIN_CAM_PWR, LOW); digitalWrite(PIN_CAM_REC, LOW);
      acSt.on = false; digitalWrite(PIN_AC_PWR, LOW); digitalWrite(PIN_AC_FROID, LOW); digitalWrite(PIN_AC_CHAUD, LOW);
      tvSt.on = false; digitalWrite(PIN_TV_R, LOW); digitalWrite(PIN_TV_G, LOW); digitalWrite(PIN_TV_B, LOW);
      rideau1St.on = false; digitalWrite(PIN_RIDEAU1, LOW);
      rideau2St.on = false; digitalWrite(PIN_RIDEAU2, LOW);
      vacSt.on = false; digitalWrite(PIN_VAC_PWR, LOW); digitalWrite(PIN_VAC_STD, LOW);
      doorSt.locked = true; doorServo.write(0);
      alarmSt.armed = false; alarmSt.triggered = false;
      Serial.println("All OFF / Door LOCKED");
    } else if (btnCycle == 1) {
      // All ON
      lightSt.on = true; ledcWrite(PIN_LIGHT, 255);
      cameraSt.on = true; cameraSt.rec = true; digitalWrite(PIN_CAM_PWR, HIGH); digitalWrite(PIN_CAM_REC, HIGH);
      acSt.on = true; strcpy(acSt.mode, "FROID"); acSt.targetTemp = 22;
      digitalWrite(PIN_AC_PWR, HIGH); digitalWrite(PIN_AC_FROID, HIGH);
      tvSt.on = true; strcpy(tvSt.app, "NETFLIX"); digitalWrite(PIN_TV_R, HIGH);
      rideau1St.on = true; rideau1St.pct = 100; digitalWrite(PIN_RIDEAU1, HIGH);
      rideau2St.on = true; rideau2St.pct = 100; digitalWrite(PIN_RIDEAU2, HIGH);
      vacSt.on = true; strcpy(vacSt.mode, "STANDARD"); digitalWrite(PIN_VAC_PWR, HIGH); digitalWrite(PIN_VAC_STD, HIGH);
      doorSt.locked = false; doorServo.write(90);
      alarmSt.armed = true;
      Serial.println("All ON / Door UNLOCKED / Alarm ARMED");
    } else {
      // Demo mode: light on, TV netflix, AC cooling
      lightSt.on = true; ledcWrite(PIN_LIGHT, 200);
      tvSt.on = true; strcpy(tvSt.app, "NETFLIX"); digitalWrite(PIN_TV_R, HIGH); digitalWrite(PIN_TV_G, LOW);
      acSt.on = true; strcpy(acSt.mode, "FROID"); digitalWrite(PIN_AC_PWR, HIGH); digitalWrite(PIN_AC_FROID, HIGH);
      Serial.println("Demo: Light+TV+AC ON");
    }
  }

  // Periodic sensor reading
  if (millis() - lastSensor > SENSOR_INT) {
    lastSensor = millis();
    readSensors();

    // Auto-AC: adjust cooling/heating based on real temperature
    if (acSt.on) {
      acSt.currentTemp = (int)envTemp;
      bool autoMode = (strcmp(acSt.mode, "AUTO") == 0);
      bool froid = (strcmp(acSt.mode, "FROID") == 0);
      bool chaud = (strcmp(acSt.mode, "CHAUD") == 0);
      digitalWrite(PIN_AC_FROID, froid || (autoMode && envTemp > acSt.targetTemp));
      digitalWrite(PIN_AC_CHAUD, chaud || (autoMode && envTemp < acSt.targetTemp));
    }
  }

  // Periodic telemetry
  if (millis() - lastTelemetry > TELEMETRY_INT) {
    lastTelemetry = millis();
    publishTelemetry();
  }

  // Alarm LED blink effect when triggered
  if (alarmSt.triggered && (millis() - lastBlink > 300)) {
    lastBlink = millis();
    blinkState = !blinkState;
    digitalWrite(PIN_ALARM_LED, blinkState);
    if (blinkState) tone(PIN_BUZZER, 800, 200);
  } else if (!alarmSt.triggered) {
    digitalWrite(PIN_ALARM_LED, alarmSt.armed ? HIGH : LOW);
    noTone(PIN_BUZZER);
  }
}
