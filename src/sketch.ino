#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ==========================================
// CONFIGURATION RÉSEAU & CONFIGURATION MQTT
// ==========================================
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* mqtt_server = "broker.hivemq.com"; // Serveur HiveMQ plus stable pour la simulation

WiFiClient espClient;
PubSubClient client(espClient);

// Topics MQTT (Identifiants uniques des appareils)
const char* topic_salon     = "smart/home/appareil/6a0cf42e7264a021407dae9d";
const char* topic_tv        = "smart/home/appareil/6a0e0999a05e12a54e87872b";
const char* topic_camera    = "smart/home/appareil/6a0cf43a7264a021407dae9e";
const char* topic_clima_sub = "smart/home/appareil/6a0cf4487264a021407dae9f";
const char* topic_rideau    = "smart/home/appareil/6a10d99c513a833a7ea56ed0";
const char* topic_vacuum    = "smart/home/appareil/6a10dc92513a833a7ea56ed1";
const char* topic_clima_pub = "smart/home/climatiseur/mesures";
const char* topic_energy_pub = "smart/home/appareils/consommation";

// ==========================================
// CONFIGURATION DES BROCHES (PINS)
// ==========================================
#define DHTPIN 23
#define DHTTYPE DHT11

const int ledSalon = 2, ledCamera = 26, ledCameraRec = 14;
const int vacuumLed = 19, climaPower = 13, climaTemp = 12;
const int rideauLed = 27, rgbRed = 32, rgbGreen = 33, rgbBlue = 25;

LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(DHTPIN, DHTTYPE);

// Variables globales de contrôle de temps (Non-blocking)
bool camRec = false;
unsigned long prevBlink = 0;
unsigned long prevEnergy = 0;
unsigned long lastMQTTAttempt = 0;

// ==========================================
// FONCTION : CONNEXION AU RÉSEAU WIFI
// ==========================================
void setupWifi() {
  Serial.println("[WIFI] Connexion en cours...");
  WiFi.begin(ssid, password);
  
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    // Timeout après 15 secondes pour éviter le blocage complet du simulateur
    if (millis() - start > 15000) { 
      Serial.println("\n[WIFI] ÉCHEC de connexion");
      return;
    }
  }
  Serial.println("\n[WIFI] CONNECTÉ - IP: " + WiFi.localIP().toString());
}

// ==========================================
// FONCTION : CONNEXION AU BROKER MQTT
// ==========================================
void reconnectMQTT() {
  if (client.connected()) return;
  
  Serial.println("[MQTT] Tentative de connexion...");
  
  // Génération d'un ID client unique en utilisant un tableau de caractères (Sûr pour la RAM)
  char clientId[30];
  snprintf(clientId, sizeof(clientId), "ESP32_Smart_%04X", random(0xFFFF));
  
  // Timeout court pour éviter que le simulateur ne gèle en attendant le serveur
  espClient.setTimeout(4); 
  
  if (client.connect(clientId)) {
    Serial.println("[MQTT] CONNECTÉ ✓");
    // Inscription aux différents Topics
    client.subscribe(topic_salon);
    client.subscribe(topic_tv);
    client.subscribe(topic_camera);
    client.subscribe(topic_vacuum);
    client.subscribe(topic_clima_sub);
    client.subscribe(topic_rideau);
    
    lcd.clear();
    lcd.print("MQTT OK");
  } else {
    Serial.print("[MQTT] ÉCHEC, code d'erreur: ");
    Serial.println(client.state());
  }
}

// ==========================================
// FONCTION : RÉCEPTION DES MESSAGES MQTT (CALLBACK)
// ==========================================
void callback(char* topic, byte* payload, unsigned int length) {
  // Conversion sécurisée du payload en chaîne de caractères (char array au lieu de String)
  char msg[64];
  if (length > 63) length = 63;
  memcpy(msg, payload, length);
  msg[length] = '\0'; // Fin de chaîne
  
  Serial.print("[MQTT IN] ");
  Serial.print(topic);
  Serial.print(" => ");
  Serial.println(msg);

  // --- Gestion du Salon ---
  if (strcmp(topic, topic_salon) == 0) {
    digitalWrite(ledSalon, strcmp(msg, "OFF") != 0);
  }
  
  // --- Gestion de la Caméra ---
  if (strcmp(topic, topic_camera) == 0) {
    if (strcmp(msg, "OFF") == 0)       { digitalWrite(ledCamera, LOW); camRec = false; }
    else if (strcmp(msg, "ON") == 0)   { digitalWrite(ledCamera, HIGH); camRec = false; }
    else if (strcmp(msg, "REC") == 0)  { digitalWrite(ledCamera, HIGH); camRec = true; }
  }
  
  // --- Gestion de l'Aspirateur ---
  if (strcmp(topic, topic_vacuum) == 0) {
    digitalWrite(vacuumLed, strcmp(msg, "OFF") != 0);
  }
  
  // --- Gestion du Climatiseur (Souscription) ---
  if (strcmp(topic, topic_clima_sub) == 0) {
    bool on = (strcmp(msg, "OFF") != 0);
    digitalWrite(climaPower, on);
    digitalWrite(climaTemp, on);
  }
  
  // --- Gestion du Rideau ---
  if (strcmp(topic, topic_rideau) == 0) {
    digitalWrite(rideauLed, atoi(msg) > 0);
  }
  
  // --- Gestion de la Télévision (Indicateurs RGB + Écran LCD) ---
  if (strcmp(topic, topic_tv) == 0) {
    bool hasNetflix = (strstr(msg, "NETFLIX") != NULL);
    bool hasSpotify = (strstr(msg, "SPOTIFY") != NULL);
    bool isOff = (strcmp(msg, "OFF") == 0);
    
    // Contrôle de la LED RGB selon la source active
    digitalWrite(rgbRed,   !isOff && hasNetflix);
    digitalWrite(rgbGreen, !isOff && hasSpotify);
    digitalWrite(rgbBlue,  !isOff && !hasNetflix && !hasSpotify);
    
    // Mise à jour de l'affichage LCD
    lcd.clear();
    if (isOff)           lcd.print("TV OFF");
    else if (hasNetflix) lcd.print("TV NETFLIX");
    else if (hasSpotify) lcd.print("TV SPOTIFY");
    else                 lcd.print("TV ACTIVE");
  }
}

// ==========================================
// INITIALISATION DU SYSTÈME (SETUP)
// ==========================================
void setup() {
  Serial.begin(115200);
  delay(500); 
  
  // Initialisation de l'écran LCD I2C
  Wire.begin(21, 22);
  lcd.init();
  delay(100);
  lcd.backlight();
  lcd.clear();
  lcd.print("SMART HOME INIT");

  // Initialisation du capteur de température DHT
  dht.begin();

  // Configuration de toutes les broches en sortie (OUTPUT)
  int pins[] = {ledSalon, ledCamera, ledCameraRec, vacuumLed,
                climaPower, climaTemp, rideauLed, rgbRed, rgbGreen, rgbBlue};
  for (int p : pins) pinMode(p, OUTPUT);

  // Connexion Wi-Fi initiale
  setupWifi();
  
  // Configuration du client MQTT
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
  client.setKeepAlive(30);     // Intervalle réduit pour correspondre à la réactivité du simulateur
  client.setSocketTimeout(5);  // Évite les blocages réseau prolongés
  
  Serial.println("[SYSTEM] PRÊT");
  lcd.clear();
  lcd.print("Connexion MQTT..");
}

// ==========================================
// BOUCLE PRINCIPALE (LOOP)
// ==========================================
void loop() {
  // Vérification de la connexion Wi-Fi toutes les 10 secondes (Évite de saturer le CPU)
  if (WiFi.status() != WL_CONNECTED) {
    if (millis() % 10000 < 10) { 
       setupWifi();
    }
  }

  // Gestion de la connexion et des paquets MQTT
  if (!client.connected()) {
    unsigned long now = millis();
    if (now - lastMQTTAttempt > 15000) {  // Tentative de reconnexion toutes les 15 secondes
      lastMQTTAttempt = now;
      reconnectMQTT();
    }
  } else {
    client.loop(); // Traite les messages entrants/sortants uniquement si connecté
  }

  // Clignotement de la LED d'enregistrement Caméra (Sans bloquer le code)
  if (camRec && (millis() - prevBlink > 500)) {
    prevBlink = millis();
    digitalWrite(ledCameraRec, !digitalRead(ledCameraRec));
  } else if (!camRec) {
    digitalWrite(ledCameraRec, LOW);
  }

  // Lecture du capteur DHT + Publication des données toutes les 15 secondes
  if (millis() - prevEnergy > 15000) {  
    prevEnergy = millis();
    
    float t = dht.readTemperature();
    float h = dht.readHumidity();  
    
    // Vérification que les valeurs lues sont valides
    if (!isnan(t) && !isnan(h)) {
      // Formatage du payload JSON de manière optimisée pour la RAM
      char payload[64];
      snprintf(payload, sizeof(payload), "{\"temp\":%.1f,\"hum\":%.1f}", t, h);
      
      // Envoi des messages si le broker est connecté
      if (client.connected()) {
        client.publish(topic_clima_pub, payload);
        delay(10); // Petit délai technique pour éviter la collision de paquets réseau
        client.publish(topic_energy_pub, "{\"status\":\"OK\"}");
        Serial.println("[SENSOR] Donnees publiees avec succes");
      }
      
      // Affichage local sur le Moniteur Série et le LCD
      Serial.print("[SENSOR] Local: ");
      Serial.println(payload);
      
      lcd.clear();
      lcd.print("T:"); lcd.print(t, 1);
      lcd.print("C H:"); lcd.print(h, 0); lcd.print("%");
    } else {
      Serial.println("[SENSOR] Erreur de lecture DHT");
    }
  }
}