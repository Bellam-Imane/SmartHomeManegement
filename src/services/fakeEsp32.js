const mqtt = require('mqtt');

// ── 1️⃣ CONFIGURATION DES APPAREILS (ALIGNÉE SUR VOS IDs RÉELS DE LA DATABASE) ──
const devices = {
  lampe:            "6a0cf42e7264a021407dae9d", 
  camera:           "6a0cf43a7264a021407dae9e", 
  climatiseur:      "6a0cf4487264a021407dae9f", 
  tv:               "6a0e0999a05e12a54e87872b", 
  rideau1:          "6a10d976513a833a7ea56ecf", 
  rideau2:          "6a10d99c513a833a7ea56ed0", 
  vacuum:           "6a10dc92513a833a7ea56ed1",
  // Nouveaux appareils de securite (IDs a remplacer par les vrais IDs de votre DB)
  porte:            "6a2cf42e7264a021407daea0",
  capteurMouvement: "6a2cf43a7264a021407daea1",
  capteurFumee:     "6a2cf4487264a021407daea2",
};

// Puissances nominales de référence (en Watts)
const BASE_POWER = {
  [devices.climatiseur]: 350,
  [devices.lampe]: 45,
  [devices.tv]: 120,
  [devices.vacuum]: 200,
  [devices.camera]: 15,
  [devices.rideau1]: 30,   // Rideaux motorisés
  [devices.rideau2]: 30,
  [devices.porte]: 5,      // Serrure intelligente (veille)
};

// ── 2️⃣ ÉTATS INITIAUX DES APPAREILS ──
let states = {
  [devices.lampe]:            { status: "ENLIGNE", consommationActuelle: BASE_POWER[devices.lampe] },
  [devices.camera]:           { status: "ENLIGNE", consommationActuelle: BASE_POWER[devices.camera] }, 
  [devices.climatiseur]:      { status: "ENLIGNE", consommationActuelle: BASE_POWER[devices.climatiseur], temperatureActuelle: 22, temperatureCible: 22 },
  [devices.tv]:               { status: "ENLIGNE", consommationActuelle: BASE_POWER[devices.tv] },
  [devices.rideau1]:          { status: "ENLIGNE", consommationActuelle: BASE_POWER[devices.rideau1], position: 40 }, 
  [devices.rideau2]:          { status: "ENLIGNE", consommationActuelle: BASE_POWER[devices.rideau2], position: 60 },
  [devices.vacuum]:           { status: "HORSLIGNE", consommationActuelle: 0 },
  // Porte intelligente — verrouillée par défaut, faible consommation de veille
  [devices.porte]:            { status: "ENLIGNE", consommationActuelle: BASE_POWER[devices.porte], estVerrouillee: true },
  // Capteur de mouvement — toujours en ligne, détection aléatoire
  [devices.capteurMouvement]: { status: "ENLIGNE", consommationActuelle: 3, typeCapteur: "MOUVEMENT", detected: false },
  // Capteur de fumée — toujours en ligne, valeur PPM stable
  [devices.capteurFumee]:     { status: "ENLIGNE", consommationActuelle: 2, typeCapteur: "FUMEE", valeurActuelle: 15 },
};

// ── 3️⃣ CONNEXION AU BROKER MQTT ──
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
      client.publish(COMMAND_TOPIC, JSON.stringify({ action: "ASK_STATUS" }));
    }
  });

  // Subscribe to per-device topics (real MQTT commands from backend)
  Object.keys(devices).forEach((key) => {
    const deviceTopic = `smart/home/appareil/${devices[key]}`;
    client.subscribe(deviceTopic, (err) => {
      if (!err) console.log(`📥 [SYNC] Abonné à ${key} => ${deviceTopic}`);
    });
  });

  // Subscribe to security topics
  client.subscribe('smart/home/portes', (err) => { if (!err) console.log('📥 [SYNC] Abonné à smart/home/portes'); });
  client.subscribe('smart/home/alarme', (err) => { if (!err) console.log('📥 [SYNC] Abonné à smart/home/alarme'); });
});

// ── 4️⃣ RÉCEPTION ET TRAITEMENT DES COMMANDES ──
client.on('message', (topic, message) => {
  const msgStr = message.toString();

  // ── Per-device topics: smart/home/appareil/{id} ──
  if (topic.startsWith('smart/home/appareil/')) {
    const deviceId = topic.split('/').pop();
    const parts = msgStr.split(':');
    const action = (parts[0] || '').toUpperCase();
    const isOn = (action === 'ON');

    if (states[deviceId]) {
      states[deviceId].status = isOn ? "ENLIGNE" : "HORSLIGNE";
      if (BASE_POWER[deviceId] !== undefined) {
        states[deviceId].consommationActuelle = isOn ? BASE_POWER[deviceId] : 0;
      }
      console.log(`🔌 [PER-DEVICE] ${deviceId} => ${states[deviceId].status} | Raw: ${msgStr}`);

      // Parse type-specific data
      if (deviceId === devices.climatiseur && parts.length >= 3) {
        states[deviceId].temperatureCible = parseInt(parts[2]) || 24;
        console.log(`🌡️ [AC] Target temp: ${states[deviceId].temperatureCible}°C`);
      }
      if (deviceId === devices.porte && parts.length >= 2) {
        states[deviceId].estVerrouillee = (parts[1].toUpperCase() === 'LOCKED');
        console.log(`🔒 [DOOR] ${states[deviceId].estVerrouillee ? 'VERROUILLÉE' : 'DÉVERROUILLÉE'}`);
      }
    }
    return;
  }

  // ── Security topics ──
  if (topic === 'smart/home/portes') {
    const parts = msgStr.split(':');
    const isLock = (parts[0] || '').toUpperCase() === 'LOCK';
    if (states[devices.porte]) {
      states[devices.porte].estVerrouillee = isLock;
      console.log(`🔒 [PORTES] ${isLock ? 'VERROUILLÉE' : 'DÉVERROUILLÉE'} (${parts[1] || 'unknown'})`);
    }
    return;
  }

  if (topic === 'smart/home/alarme') {
    const isArmed = msgStr.trim().toUpperCase() === 'ON';
    console.log(`🚨 [ALARME] ${isArmed ? 'ARMÉ' : 'DÉSARMÉ'}`);
    return;
  }

  // ── Centralized command topic (legacy) ──
  if (topic === COMMAND_TOPIC) {
    try {
      const command = JSON.parse(message.toString());
      const { deviceId, action, valeur } = command;

      if (states[deviceId]) {
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

        if (action === "LOCK" && deviceId === devices.porte) {
          states[deviceId].estVerrouillee = valeur;
          console.log(`🔒 [LOCK] Porte => ${valeur ? 'VERROUILLÉE' : 'DÉVERROUILLÉE'}`);
        }
      }
    } catch (e) {
      console.error("❌ Erreur Parsing JSON :", e.message);
    }
  }
});

// ── 5️⃣ ENVOI DE LA TÉLÉMÉTRIE EN CONTINU (TOUTES LES 10 SECONDES) ──
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

  // Simulation aléatoire du capteur de mouvement (détection toutes les ~30s)
  const motionId = devices.capteurMouvement;
  states[motionId].detected = Math.random() > 0.7;
  if (states[motionId].detected) {
    console.log(`🚶 [MOTION] Mouvement détecté !`);
  }

  // Simulation du capteur de fumée (PPM stable avec légère variation)
  const smokeId = devices.capteurFumee;
  states[smokeId].valeurActuelle = +(12 + Math.random() * 8).toFixed(1);

  // Boucle d'envoi unifiée pour tous les appareils
  Object.keys(devices).forEach((key) => {
    const id = devices[key];
    const payload = {};

    // Consommation en Watts (avec variation aléatoire pour les appareils actifs)
    if (states[id].consommationActuelle !== undefined) {
      let wattsEnvoyes = states[id].consommationActuelle;

      if (wattsEnvoyes > 0 && id !== devices.lampe && id !== devices.porte) {
        wattsEnvoyes = Math.floor(wattsEnvoyes * (0.96 + Math.random() * 0.08));
      }

      payload.consommationActuelle = wattsEnvoyes;
      console.log(`⚡ [ENERGY] ${key} => ${wattsEnvoyes} W [${states[id].status}]`);

      // Données spécifiques au climatiseur
      if (id === devices.climatiseur) {
        payload.temperatureActuelle = states[id].temperatureActuelle;
        console.log(`🌡️ [SENSOR] Climatiseur Température => ${states[id].temperatureActuelle} °C`);
      }
    }
    
    // Position des rideaux motorisés
    if (states[id].position !== undefined) {
      payload.position = states[id].position;
      console.log(`🪟 [POSITION] ${key} => ${states[id].position} %`);
    }

    // État de la porte intelligente
    if (states[id].estVerrouillee !== undefined) {
      payload.estVerrouillee = states[id].estVerrouillee;
      console.log(`🔒 [DOOR] ${key} => ${states[id].estVerrouillee ? 'VERROUILLÉE' : 'DÉVERROUILLÉE'}`);
    }

    // Capteur de mouvement
    if (states[id].typeCapteur === "MOUVEMENT") {
      payload.typeCapteur = "MOUVEMENT";
      payload.detected = states[id].detected;
    }

    // Capteur de fumée
    if (states[id].typeCapteur === "FUMEE") {
      payload.typeCapteur = "FUMEE";
      payload.valeurActuelle = states[id].valeurActuelle;
      console.log(`💨 [SMOKE] ${key} => ${states[id].valeurActuelle} PPM`);
    }

    client.publish(TELEMETRIE_TOPIC, JSON.stringify({
      deviceId: id,
      payload: payload
    }));
  });

}, 10000);
