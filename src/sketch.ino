#include <WiFi.h>
#include <PubSubClient.h>
#include <DHTesp.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ==========================================
// CONFIGURATION RÉSEAU & MQTT (Wokwi)
// ==========================================
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const int wifiChannel = 6;
const uint8_t wokwiBssid[] = {0x42, 0x13, 0x37, 0x55, 0xAA, 0x01};
const char* mqtt_server = "broker.emqx.io";

WiFiClient espClient;
PubSubClient client(espClient);

// Topics MQTT (IDs alignés avec seed.js)
const char* topic_salon     = "smart/home/appareil/6a0cf42e7264a021407dae9d";
const char* topic_tv        = "smart/home/appareil/6a0e0999a05e12a54e87872b";
const char* topic_camera    = "smart/home/appareil/6a0cf43a7264a021407dae9e";
const char* topic_clima_sub = "smart/home/appareil/6a0cf4487264a021407dae9f";
const char* topic_rideau    = "smart/home/appareil/6a10d99c513a833a7ea56ed0";
const char* topic_vacuum    = "smart/home/appareil/6a10dc92513a833a7ea56ed1";
const char* topic_telemetrie_pub = "smart/home/appareils/telemetrie";
const char* topic_energy_pub = "smart/home/appareils/consommation";

// ==========================================
// BROCHES (doivent correspondre à diagram.json)
// ==========================================
#define DHTPIN 23

const int ledSalon = 2;
const int ledCamera = 26;
const int ledCameraRec = 14;
const int vacuumLed = 19;
const int climaPower = 13;
const int climaTemp = 12;
const int rideauLed = 27;
const int rgbRed = 32;
const int rgbGreen = 33;
const int rgbBlue = 25;

LiquidCrystal_I2C lcd(0x27, 16, 2);
DHTesp dht;

bool camRec = false;
unsigned long prevBlink = 0;
unsigned long prevEnergy = 0;
unsigned long lastMQTTAttempt = 0;
unsigned long lastWifiRetry = 0;
void printWifiScan() {
  Serial.println("[WIFI] Scan des reseaux...");
  int count = WiFi.scanNetworks();
  if (count <= 0) {
    Serial.println("[WIFI] Aucun reseau detecte !");
    Serial.println("[WIFI] => Verifiez F1 > Desactiver Private IoT Gateway");
    Serial.println("[WIFI] => Ou lancez l'app Wokwi IoT Gateway sur votre PC");
    return;
  }
  bool found = false;
  for (int i = 0; i < count; i++) {
    Serial.print("  - ");
    Serial.print(WiFi.SSID(i));
    Serial.print(" (RSSI ");
    Serial.print(WiFi.RSSI(i));
    Serial.println(")");
    if (WiFi.SSID(i) == ssid) found = true;
  }
  if (!found) {
    Serial.println("[WIFI] Wokwi-GUEST introuvable dans le scan !");
  }
}

void setupWifi(bool isRetry) {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println("[WIFI] Connexion en cours...");
  WiFi.mode(WIFI_STA);

  if (isRetry) {
    WiFi.disconnect(true);
    delay(200);
  }

  WiFi.begin(ssid, password, wifiChannel, wokwiBssid);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(100);
    Serial.print(".");
    if (millis() - start > 20000) {
      Serial.println("\n[WIFI] Echec de connexion");
      Serial.print("[WIFI] Status: ");
      Serial.println(WiFi.status());
      printWifiScan();
      return;
    }
  }
  Serial.println("\n[WIFI] Connecte - IP: " + WiFi.localIP().toString());
}

void reconnectMQTT() {
  if (client.connected() || WiFi.status() != WL_CONNECTED) return;

  Serial.println("[MQTT] Tentative de connexion...");

  char clientId[30];
  snprintf(clientId, sizeof(clientId), "ESP32_Smart_%04X", random(0xFFFF));

  espClient.setTimeout(10);

  if (client.connect(clientId)) {
    Serial.println("[MQTT] Connecte");
    client.subscribe(topic_salon);
    client.subscribe(topic_tv);
    client.subscribe(topic_camera);
    client.subscribe(topic_vacuum);
    client.subscribe(topic_clima_sub);
    client.subscribe(topic_rideau);

    lcd.clear();
    lcd.print("MQTT OK");
  } else {
    Serial.print("[MQTT] Echec, code: ");
    Serial.println(client.state());
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  char msg[64];
  if (length > 63) length = 63;
  memcpy(msg, payload, length);
  msg[length] = '\0';

  Serial.print("[MQTT IN] ");
  Serial.print(topic);
  Serial.print(" => ");
  Serial.println(msg);

  if (strcmp(topic, topic_salon) == 0) {
    digitalWrite(ledSalon, strcmp(msg, "OFF") != 0);
  }

  if (strcmp(topic, topic_camera) == 0) {
    if (strcmp(msg, "OFF") == 0) {
      digitalWrite(ledCamera, LOW);
      camRec = false;
    } else if (strcmp(msg, "ON") == 0) {
      digitalWrite(ledCamera, HIGH);
      camRec = false;
    } else if (strcmp(msg, "REC") == 0) {
      digitalWrite(ledCamera, HIGH);
      camRec = true;
    }
  }

  if (strcmp(topic, topic_vacuum) == 0) {
    digitalWrite(vacuumLed, strcmp(msg, "OFF") != 0);
  }

  if (strcmp(topic, topic_clima_sub) == 0) {
    bool on = (strcmp(msg, "OFF") != 0);
    digitalWrite(climaPower, on);
    digitalWrite(climaTemp, on);
  }

  if (strcmp(topic, topic_rideau) == 0) {
    digitalWrite(rideauLed, atoi(msg) > 0);
  }

  if (strcmp(topic, topic_tv) == 0) {
    bool hasNetflix = (strstr(msg, "NETFLIX") != NULL);
    bool hasSpotify = (strstr(msg, "SPOTIFY") != NULL);
    bool isOff = (strcmp(msg, "OFF") == 0);

    digitalWrite(rgbRed, !isOff && hasNetflix);
    digitalWrite(rgbGreen, !isOff && hasSpotify);
    digitalWrite(rgbBlue, !isOff && !hasNetflix && !hasSpotify);

    lcd.clear();
    if (isOff)           lcd.print("TV OFF");
    else if (hasNetflix) lcd.print("TV NETFLIX");
    else if (hasSpotify) lcd.print("TV SPOTIFY");
    else                 lcd.print("TV ACTIVE");
  }
}

void setup() {
  Serial.begin(115200);
  delay(100);

  // WiFi en premier (avant LCD/DHT qui bloquent le simulateur)
  setupWifi(false);

  Wire.begin(21, 22);
  lcd.init();
  delay(100);
  lcd.backlight();
  lcd.clear();
  lcd.print("SMART HOME INIT");

  dht.setup(DHTPIN, DHTesp::DHT11);
  delay(1000);

  int pins[] = {ledSalon, ledCamera, ledCameraRec, vacuumLed,
                climaPower, climaTemp, rideauLed, rgbRed, rgbGreen, rgbBlue};
  for (int i = 0; i < 10; i++) {
    pinMode(pins[i], OUTPUT);
    digitalWrite(pins[i], LOW);
  }

  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  client.setKeepAlive(30);
  client.setSocketTimeout(10);

  Serial.println("[SYSTEM] Pret");
  lcd.clear();
  lcd.print("Connexion MQTT..");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    unsigned long now = millis();
    if (now - lastWifiRetry > 10000) {
      lastWifiRetry = now;
      setupWifi(true);
    }
  }

  if (!client.connected()) {
    unsigned long now = millis();
    if (now - lastMQTTAttempt > 5000) {
      lastMQTTAttempt = now;
      reconnectMQTT();
    }
  } else {
    client.loop();
  }

  if (camRec && (millis() - prevBlink > 500)) {
    prevBlink = millis();
    digitalWrite(ledCameraRec, !digitalRead(ledCameraRec));
  } else if (!camRec) {
    digitalWrite(ledCameraRec, LOW);
  }

  if (millis() - prevEnergy > 15000) {
    prevEnergy = millis();

    TempAndHumidity data = dht.getTempAndHumidity();
    float t = data.temperature;
    float h = data.humidity;

    if (dht.getStatus() == 0 && !isnan(t) && !isnan(h)) {
      char payload[150];
      snprintf(payload, sizeof(payload),
               "{\"deviceId\":\"6a0cf4487264a021407dae9f\",\"payload\":{\"temperatureActuelle\":%.1f}}",
               t);

      if (client.connected()) {
        client.publish(topic_telemetrie_pub, payload);
        delay(10);
        client.publish(topic_energy_pub, "{\"status\":\"OK\"}");
        Serial.println("[SENSOR] Donnees publiees");
      }

      Serial.print("[SENSOR] Local: ");
      Serial.println(payload);

      lcd.clear();
      lcd.print("T:");
      lcd.print(t, 1);
      lcd.print("C H:");
      lcd.print(h, 0);
      lcd.print("%");
    } else {
      Serial.print("[SENSOR] Erreur DHT: ");
      Serial.println(dht.getStatusString());
    }
  }
}
