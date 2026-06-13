const mqtt = require('mqtt');

// ── 1️⃣ CONFIGURATION DES APPAREILS (ALIGNÉE SUR VOS IDs RÉELS DE LA DATABASE) ──
const devices = {
  lampe:       "6a0cf42e7264a021407dae9d", 
  camera:      "6a0cf43a7264a021407dae9e", 
  climatiseur: "6a0cf4487264a021407dae9f", 
  tv:          "6a0e0999a05e12a54e87872b", 
  rideau1:     "6a10d976513a833a7ea56ecf", 
  rideau2:     "6a10d99c513a833a7ea56ed0", 
  vacuum:      "6a10dc92513a833a7ea56ed1"  
};

// Puissances nominales de référence
const BASE_POWER = {
  [devices.climatiseur]: 350,
  [devices.lampe]: 45,
  [devices.tv]: 120,
  [devices.vacuum]: 200,
  [devices.camera]: 15
};

// Injection d'un état "Pre-Allumé" intelligent par défaut pour court-circuiter le bug du zéro
let states = {
  [devices.lampe]:       { status: "ENLIGNE", consommationActuelle: BASE_POWER[devices.lampe] },
  [devices.camera]:      { status: "ENLIGNE", consommationActuelle: BASE_POWER[devices.camera] }, 
  [devices.climatiseur]: { status: "ENLIGNE", consommationActuelle: BASE_POWER[devices.climatiseur], temperatureActuelle: 22, temperatureCible: 22 },
  [devices.tv]:          { status: "ENLIGNE", consommationActuelle: BASE_POWER[devices.tv] },
  [devices.rideau1]:     { status: "ENLIGNE", position: 40 }, 
  [devices.rideau2]:     { status: "ENLIGNE", position: 60 },
  [devices.vacuum]:      { status: "HORSLIGNE", consommationActuelle: 0 } // L'aspirateur reste OFF au démarrage
};

// ── 2️⃣ CONNEXION AU BROKER MQTT ──
const MQTT_BROKER = 'mqtt://broker.emqx.io'; 
const MQTT_PORT = 1883;

const client = mqtt.connect(MQTT_BROKER, {
    port: MQTT_PORT,
    clientId: `Fake_ESP32_Device_${Math.random().toString(16).slice(2)}`,
    clean: true
});

const COMMAND_TOPIC = "smart/home/appareils/commandes";
const TELEMETRIE_TOPIC = "smart/home/appareils/telemetrie";

client.on('connect', () => {
  console.log(`✅ Fake ESP32 connecté au Broker EMQX [${MQTT_BROKER}:${MQTT_PORT}]`);
  
  client.subscribe(COMMAND_TOPIC, (err) => {
    if (!err) {
      console.log(`📥 Abonné au topic des commandes. Sync initiale en cours...`);
      // Tentative de récupération des états précis de la DB
      client.publish(COMMAND_TOPIC, JSON.stringify({ action: "ASK_STATUS" }));
    }
  });
});

// ── 3️⃣ RÉCEPTION ET TRAITEMENT DES COMMANDES ET SYNCHRONISATIONS ──
client.on('message', (topic, message) => {
  if (topic === COMMAND_TOPIC) {
    try {
      const command = JSON.parse(message.toString());
      const { deviceId, action, valeur } = command;

      if (states[deviceId]) {
        // Traitement unifié du contrôle direct et du retour de synchronisation Database
        if (action === "TOGGLE" || action === "SYNC_STATUS") {
          const isOn = valeur; 
          states[deviceId].status = isOn ? "ENLIGNE" : "HORSLIGNE";
          
          if (BASE_POWER[deviceId] !== undefined) {
            states[deviceId].consommationActuelle = isOn ? BASE_POWER[deviceId] : 0;
          }
          console.log(`🔌 [SYNC/COMMAND] Appareil [${deviceId}] => Status: ${states[deviceId].status} (${states[deviceId].consommationActuelle} W)`);
        }
        
        if (action === "SET_TEMPERATURE" && deviceId === devices.climatiseur) {
          states[deviceId].temperatureCible = valeur;
        }

        if (action === "SET_POSITION" && (deviceId === devices.rideau1 || deviceId === devices.rideau2)) {
          states[deviceId].position = valeur;
        }
      }
    } catch (e) {
      console.error("❌ Erreur Parsing JSON :", e.message);
    }
  }
});

// ── 4️⃣ ENVOI DE LA TÉLÉMÉTRIE EN CONTINU (TOUTES LES 10 SECONDES) ──
setInterval(() => {
  console.log("\n--------------------------------------------------");
  console.log(`🔄 [MQTT PUSH] Envoi du cycle de télémétrie...`);
  console.log("--------------------------------------------------");
  
  // Gestion de la température du Climatiseur
  const climId = devices.climatiseur;
  if (states[climId].consommationActuelle > 0) {
    const target = states[climId].temperatureCible || 22;
    const current = states[climId].temperatureActuelle;
    states[climId].temperatureActuelle += (target > current) ? 0.2 : -0.2;
    states[climId].temperatureActuelle = +states[climId].temperatureActuelle.toFixed(1);
  } else {
    states[climId].temperatureActuelle = +(24 + Math.random() * 2).toFixed(1);
  }

  // Boucle d'envoi unifiée
  Object.keys(devices).forEach((key) => {
    const id = devices[key];
    const payload = {};

    if (states[id].consommationActuelle !== undefined) {
      let wattsEnvoyes = states[id].consommationActuelle;

      if (wattsEnvoyes > 0 && id !== devices.lampe) {
        wattsEnvoyes = Math.floor(wattsEnvoyes * (0.96 + Math.random() * 0.08));
      }

      payload.consommationActuelle = wattsEnvoyes;
      console.log(`⚡ [ENERGY] ${key} => ${wattsEnvoyes} W [${states[id].status}]`);

      if (id === devices.climatiseur) {
        payload.temperatureActuelle = states[id].temperatureActuelle;
        console.log(`🌡️ [SENSOR] Climatiseur Température => ${states[id].temperatureActuelle} °C`);
      }
    }
    
    if (states[id].position !== undefined) {
      payload.position = states[id].position;
      console.log(`🪟 [POSITION] ${key} => ${states[id].position} %`);
    }

    client.publish(TELEMETRIE_TOPIC, JSON.stringify({
      deviceId: id,
      payload: payload
    }));
  });

}, 10000);