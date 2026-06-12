const mqtt = require('mqtt');
const mongoose = require('mongoose');

// Importations des services d'archivage InfluxDB
const { saveSensorData, saveDeviceConsumption } = require('../services/influxService'); 

// Chargement des modèles nécessaires
const Appareil = require('../models/Appareil');
const SystemeGestionEnergetique = require('../models/SystemeGestionEnergetique');
const Regle = require('../models/Regle'); // 💡 Ajout du modèle Regle pour l'automation événementielle

// Configurations du Broker MQTT
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

let client = null;

// Topic central pour les commandes ESP32 (utilisé par Wokwi et fakeEsp32)
const TOPIC_COMMANDES = 'smart/home/appareils/commandes';

// Topic telemetry pour la réception des données des capteurs
const TOPIC_TELEMETRIE = 'smart/home/appareils/telemetrie';

/**
 * 📡 INITIALISATION DU CLIENT MQTT GLOBAL
 * S'occupe de la connexion, des souscriptions et du routage des messages
 */
const initializeMqtt = (io) => {
    console.log(`📡 Connexion MQTT en cours sur : ${MQTT_BROKER}:${MQTT_PORT}`);

    client = mqtt.connect(MQTT_BROKER, {
        port: MQTT_PORT,
        clientId: `Backend_MQTT_${Math.random().toString(16).slice(2)}`,
        clean: true,
        reconnectPeriod: 5000
    });

    client.on('connect', () => {
        console.log('✅ MQTT connecté avec succès au Broker');

        // Souscription aux flux de télémétrie (Flux montant)
        client.subscribe(TOPIC_TELEMETRIE, (err) => {
            if (!err) console.log(`📥 Topic abonné : ${TOPIC_TELEMETRIE}`);
        });

        // Souscription aux flux de commandes (Pour la synchronisation bidirectionnelle)
        client.subscribe(TOPIC_COMMANDES, (err) => {
            if (!err) console.log(`🔄 Topic commandes : ${TOPIC_COMMANDES}`);
        });
    });

    client.on('message', async (topic, message) => {
        const payloadRaw = message.toString();

        try {
            // ── 🔄 TRAITEMENT DE LA SYNCHRONISATION INITIALE DE L'ESP32 ──
            if (topic === TOPIC_COMMANDES) {
                let commandData;
                try { commandData = JSON.parse(payloadRaw); } catch (e) { return; }

                if (commandData.action === "ASK_STATUS") {
                    console.log("📡 SYNC demandée par un composant matériel (Wokwi/FakeESP)");

                    if (mongoose.connection.readyState !== 1) return;

                    const appareilsEnBase = await Appareil.find({}, 'status');

                    // Renvoi de l'état actuel de la DB à l'appareil demandeur
                    appareilsEnBase.forEach(app => {
                        client.publish(TOPIC_COMMANDES, JSON.stringify({
                            deviceId: app._id.toString(),
                            action: "SYNC_STATUS",
                            valeur: app.status === 'ENLIGNE'
                        }));
                    });

                    return;
                }
            }

            // ── ⚡ TRAITEMENT DE LA TÉLÉMÉTRIE EN TEMPS RÉEL (CAPTEURS) ──
            if (topic === TOPIC_TELEMETRIE) {
                let data;
                try { data = JSON.parse(payloadRaw); } catch (err) { return; }

                const { deviceId, payload } = data;

                // Validation stricte des données reçues du hardware
                if (!deviceId || !payload || !mongoose.Types.ObjectId.isValid(deviceId)) return;

                const appareilActuel = await Appareil.findById(deviceId);
                if (!appareilActuel) return;

                const updateQuery = {};

                // Calcul et incrémentation de l'énergie consommée (Wh)
                if (payload.consommationActuelle !== undefined) {
                    const watts = payload.consommationActuelle;
                    const energie = (watts * 10) / 3600;
                    const old = appareilActuel.consommationCumulee || 0;

                    updateQuery.consommationCumulee = old + energie;
                    updateQuery.consommationActuelle = watts;
                }

                if (payload.temperatureActuelle !== undefined)
                    updateQuery.temperatureActuelle = payload.temperatureActuelle;

                if (payload.position !== undefined)
                    updateQuery.position = payload.position;

                // Sauvegarde de la télémétrie fraîche dans MongoDB
                const appareilMisAJour = await Appareil.findByIdAndUpdate(
                    deviceId,
                    updateQuery,
                    { returnDocument: 'after' }
                );

                // Transfert optionnel des métriques vers InfluxDB (Séries temporelles)
                if (payload.consommationActuelle !== undefined) {
                    saveDeviceConsumption(deviceId, appareilActuel.type || 'AppareilInconnu', Number(payload.consommationActuelle));
                }

                if (payload.temperatureActuelle !== undefined) {
                    saveSensorData(appareilActuel.nomAppareil || 'CapteurTemp', 'temperature', Number(payload.temperatureActuelle));
                    
                    // 💡 ENGINE AUTOMATION : Vérification instantanée des règles à chaque rapport thermique
                    await verifierEtExecuterRegles(appareilMisAJour, io);
                }

                // Diffusion immédiate vers le Frontend via Socket.io
                if (io) {
                    io.emit('appareil_update', {
                        deviceId,
                        payload: {
                            consommationActuelle: appareilMisAJour.consommationActuelle,
                            consommationCumulee: Math.round(appareilMisAJour.consommationCumulee * 100) / 100,
                            temperatureActuelle: appareilMisAJour.temperatureActuelle,
                            position: appareilMisAJour.position
                        }
                    });
                }

                // Recalcul du tableau de bord d'énergie global si la consommation change
                if (payload.consommationActuelle !== undefined) {
                    await recalculerEnergieGlobale(io);
                }
            }

        } catch (err) {
            console.error(`❌ Erreur critique MQTT [${topic}] :`, err.message);
        }
    });
};

/**
 * 🧠 MOTEUR D'AUTOMATION ÉVÉNEMENTIELLE (REGLES DU CAPTEUR)
 * Analyse les règles actives et envoie l'ordre MQTT approprié en cas de validation du seuil
 */
async function verifierEtExecuterRegles(appareil, io) {
    try {
        // Extraction des règles actives correspondantes au type d'appareil émetteur
        const reglesActives = await Regle.find({ etat: true, 'condition.typeAppareil': appareil.type });

        for (let regle of reglesActives) {
            let conditionRemplie = false;
            
            const valeurActuelle = Number(appareil.temperatureActuelle);
            const seuil = Number(regle.condition.valeurSeuil);
            const op = regle.condition.operateur;

            // Évaluation mathématique de l'opérateur de la règle
            if (op === '>' && valeurActuelle > seuil) conditionRemplie = true;
            if (op === '<' && valeurActuelle < seuil) conditionRemplie = true;
            if (op === '==' && valeurActuelle === seuil) conditionRemplie = true;
            if (op === '!=' && valeurActuelle !== seuil) conditionRemplie = true;

            // Si le seuil est franchi, exécution immédiate de l'action configurée
            if (conditionRemplie) {
                console.log(`🤖 [AUTOMATION] Règle "${regle.nomRegle}" validée par le hardware !`);
                
                const idCible = regle.action.appareilCible.toString();
                const commandeAAffecter = regle.action.commande; // 'ON' ou 'OFF'
                const isCommandeOn = commandeAAffecter === 'ON';

                // 1️⃣ Mise à jour de l'état de l'appareil cible dans MongoDB
                const appareilCibleMAJ = await Appareil.findByIdAndUpdate(
                    idCible,
                    { 
                        status: isCommandeOn ? 'ENLIGNE' : 'HORSLIGNE', 
                        consommationActuelle: isCommandeOn ? 65 : 0 // Simulation d'une charge par défaut à l'allumage
                    },
                    { new: true }
                );

                if (appareilCibleMAJ) {
                    // 2️⃣ Publication de la commande sur le Broker MQTT pour Wokwi / fakeEsp32
                    if (client && client.connected) {
                        client.publish(TOPIC_COMMANDES, JSON.stringify({
                            deviceId: idCible,
                            action: "TOGGLE",
                            valeur: isCommandeOn
                        }));
                        console.log(`🔌 [MQTT PUSH] Ordre automatique envoyé à l'appareil ${idCible} => ${commandeAAffecter}`);
                    }

                    // 3️⃣ Synchronisation flash de l'interface utilisateur (React UI) via Socket.io
                    if (io) {
                        io.emit('appareil_update', {
                            deviceId: idCible,
                            payload: {
                                status: appareilCibleMAJ.status,
                                consommationActuelle: appareilCibleMAJ.consommationActuelle
                            }
                        });
                    }
                }
            }
        }
    } catch (err) {
        console.error("❌ Erreur au niveau du moteur d'automatisation (Regles) :", err.message);
    }
}

/**
 * ── RECALCUL DE L'ÉNERGIE GLOBALE DE LA MAISON ──
 */
async function recalculerEnergieGlobale(io) {
    try {
        const appareils = await Appareil.find({});
        const total = appareils.reduce((s, a) => s + (a.consommationCumulee || 0), 0);

        let systeme = await SystemeGestionEnergetique.findOne();
        if (!systeme) systeme = new SystemeGestionEnergetique();

        systeme.consommationTotale = Math.round(total * 100) / 100;
        systeme.balanceEnergetique = (systeme.productionTotale || 0) - systeme.consommationTotale;
        systeme.dateDerniereMiseAJour = new Date();

        await systeme.save();

        if (io) {
            io.emit('global_energy_update', {
                consommationTotale: systeme.consommationTotale,
                balanceEnergetique: systeme.balanceEnergetique
            });
        }

    } catch (err) {
        console.error("❌ Erreur recalcul global :", err.message);
    }
}

/**
 * ── ENVOI FLUSH DE SÉCURITÉ MQTT (PUBLISH EXTRÈNE) ──
 */
const publishMqttMessage = (topic, message) => {
    if (!client || !client.connected) return;
    client.publish(topic, message, { qos: 1 });
};

module.exports = {
    initializeMqtt,
    publishMqttMessage,
    publishMessage: publishMqttMessage,
    publish: publishMqttMessage
};