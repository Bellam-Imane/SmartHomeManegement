const mqtt = require('mqtt');
const mongoose = require('mongoose');

// Importations des services d'archivage InfluxDB
const { saveSensorData, saveDeviceConsumption } = require('../services/influxService');

// Chargement des modèles nécessaires
const Appareil = require('../models/Appareil');
const SystemeGestionEnergetique = require('../models/SystemeGestionEnergetique');
const Regle = require('../models/Regle');

// Utilitaire de scopage par utilisateur (User → Maison → Piece → Appareil)
const { getUsersForPiece, userRoomNames, getAppareilFilter } = require('../utils/userScope');

// Configurations du Broker MQTT
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.emqx.io';
const MQTT_PORT = process.env.MQTT_PORT || 1883;

let client = null;

// Topic central pour les commandes ESP32 (utilisé par Wokwi et fakeEsp32)
const TOPIC_COMMANDES = 'smart/home/appareils/commandes';

// Topic telemetry pour la réception des données des capteurs
const TOPIC_TELEMETRIE = 'smart/home/appareils/telemetrie';

// Topics Phase 3 — Capteurs environnementaux (DHT11, MQ-135)
const TOPIC_CLIMA_PUB = "smart/home/climatiseur/mesures";
const TOPIC_HUMI_PUB = "smart/home/capteurs/humidite";
const TOPIC_AIR_PUB = "smart/home/capteurs/air";
const TOPIC_CONSO_ACK = "smart/home/appareils/consommation";

/**
 * INITIALISATION DU CLIENT MQTT GLOBAL
 * S'occupe de la connexion, des souscriptions et du routage des messages
 */
const initializeMqtt = (io) => {
    console.log(`Connexion MQTT en cours sur : ${MQTT_BROKER}:${MQTT_PORT}`);

    client = mqtt.connect(MQTT_BROKER, {
        port: MQTT_PORT,
        clientId: `Backend_MQTT_${Math.random().toString(16).slice(2)}`,
        clean: true,
        reconnectPeriod: 5000
    });

    client.on('connect', () => {
        console.log('MQTT connecté avec succès au Broker');

        // Souscription aux flux de télémétrie (Flux montant)
        client.subscribe(TOPIC_TELEMETRIE, (err) => {
            if (!err) console.log(`Topic abonné : ${TOPIC_TELEMETRIE}`);
        });

        // Souscription aux flux de commandes (Pour la synchronisation bidirectionnelle)
        client.subscribe(TOPIC_COMMANDES, (err) => {
            if (!err) console.log(`Topic commandes : ${TOPIC_COMMANDES}`);
        });

        // Phase 3 — Capteurs environnementaux
        client.subscribe(TOPIC_CLIMA_PUB, { qos: 1 }, (err) => {
            if (!err) console.log(`Abonné au flux DHT11 : ${TOPIC_CLIMA_PUB}`);
        });
        client.subscribe(TOPIC_HUMI_PUB, { qos: 1 }, (err) => {
            if (!err) console.log(`Abonné au flux Humidité : ${TOPIC_HUMI_PUB}`);
        });
        client.subscribe(TOPIC_AIR_PUB, { qos: 1 }, (err) => {
            if (!err) console.log(`Abonné au flux Qualité Air : ${TOPIC_AIR_PUB}`);
        });
        client.subscribe(TOPIC_CONSO_ACK, { qos: 1 }, (err) => {
            if (!err) console.log(`Abonné à l'accusé de réception : ${TOPIC_CONSO_ACK}`);
        });
    });

    client.on('message', async (topic, message) => {
        const payloadRaw = message.toString();

        try {
            // ── TRAITEMENT DE LA SYNCHRONISATION INITIALE DE L'ESP32 ──
            if (topic === TOPIC_COMMANDES) {
                let commandData;
                try { commandData = JSON.parse(payloadRaw); } catch (e) { return; }

                if (commandData.action === "ASK_STATUS") {
                    console.log("SYNC demandée par un composant matériel (Wokwi/FakeESP)");

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

            // ── TRAITEMENT DE LA TÉLÉMÉTRIE EN TEMPS RÉEL (CAPTEURS) ──
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

                // Porte intelligente
                if (payload.estVerrouillee !== undefined)
                    updateQuery.estVerrouillee = payload.estVerrouillee;

                // Capteurs de sécurité (MOUVEMENT / FUMEE / HUMIDITE)
                if (payload.typeCapteur !== undefined)
                    updateQuery.typeCapteur = payload.typeCapteur;

                if (payload.detected !== undefined)
                    updateQuery.detected = payload.detected;

                if (payload.valeurActuelle !== undefined)
                    updateQuery.valeurActuelle = payload.valeurActuelle;

                if (payload.dernierDetection !== undefined)
                    updateQuery.dernierDetection = new Date(payload.dernierDetection);

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

                    // ENGINE AUTOMATION : Vérification instantanée des règles à chaque rapport thermique
                    await verifierEtExecuterRegles(appareilMisAJour, io);
                }

                // Diffusion ciblée vers les utilisateurs de la maison (Socket.IO rooms)
                if (io) {
                    const updatePayload = {
                        deviceId,
                        payload: {
                            consommationActuelle: appareilMisAJour.consommationActuelle,
                            consommationCumulee: Math.round(appareilMisAJour.consommationCumulee * 100) / 100,
                            temperatureActuelle: appareilMisAJour.temperatureActuelle,
                            position: appareilMisAJour.position,
                            status: appareilMisAJour.status,
                            estVerrouillee: appareilMisAJour.estVerrouillee,
                            typeCapteur: appareilMisAJour.typeCapteur,
                            detected: appareilMisAJour.detected,
                            valeurActuelle: appareilMisAJour.valeurActuelle
                        }
                    };

                    // Trouver les utilisateurs ayant accès à cet appareil et émettre dans leurs rooms
                    try {
                        const userIds = await getUsersForPiece(appareilMisAJour.piece);
                        const rooms = userRoomNames(userIds);
                        rooms.forEach(room => io.to(room).emit('appareil_update', updatePayload));
                    } catch (roomErr) {
                        // Fallback : émission globale en cas d'erreur
                        console.warn("[MQTT] Impossible de cibler les rooms, fallback global:", roomErr.message);
                        io.emit('appareil_update', updatePayload);
                    }
                }

                // Recalcul de l'énergie par maison si la consommation change
                if (payload.consommationActuelle !== undefined) {
                    await recalculerEnergieParMaison(appareilMisAJour.piece, io);
                }
            }

            // ── Phase 3 : Capteur DHT11 (Température ambiante) ──
            if (topic === TOPIC_CLIMA_PUB) {
                const temp = parseFloat(payloadRaw);
                if (!isNaN(temp)) {
                    await saveSensorData('dht11_salon', 'temperature', temp);
                }
            }

            // ── Phase 3 : Capteur Humidité ──
            if (topic === TOPIC_HUMI_PUB) {
                if (payloadRaw.startsWith("HUMI:")) {
                    const humidite = parseFloat(payloadRaw.split(":")[1]);
                    if (!isNaN(humidite)) {
                        await saveSensorData('dht11_salon', 'humidite', humidite);
                    }
                }
            }

            // ── Phase 3 : Capteur Qualité de l'air (MQ-135) ──
            if (topic === TOPIC_AIR_PUB) {
                if (payloadRaw.startsWith("AIR:")) {
                    const ppm = parseFloat(payloadRaw.split(":")[1]);
                    if (!isNaN(ppm)) {
                        await saveSensorData('mq135_salon', 'qualite_air', ppm);
                    }
                }
            }

            // ── Phase 3 : ESP32 consumption acknowledgment ──
            if (topic === TOPIC_CONSO_ACK) {
                console.log(`[CONSO ACK] ESP32 confirme la réception -> ${payloadRaw}`);
            }

        } catch (err) {
            console.error(`Erreur critique MQTT [${topic}] :`, err.message);
        }
    });

    client.on('error', (err) => {
        console.error("Erreur de connexion MQTT :", err.message);
    });
};

/**
 * MOTEUR D'AUTOMATION ÉVÉNEMENTIELLE (REGLES DU CAPTEUR)
 * Analyse les règles actives et envoie l'ordre MQTT approprié en cas de validation du seuil
 */
async function verifierEtExecuterRegles(appareil, io) {
    try {
        const reglesActives = await Regle.find({ etat: true, 'condition.typeAppareil': appareil.type });

        for (let regle of reglesActives) {
            let conditionRemplie = false;

            const valeurActuelle = Number(appareil.temperatureActuelle);
            const seuil = Number(regle.condition.valeurSeuil);
            const op = regle.condition.operateur;

            if (op === '>' && valeurActuelle > seuil) conditionRemplie = true;
            if (op === '<' && valeurActuelle < seuil) conditionRemplie = true;
            if (op === '==' && valeurActuelle === seuil) conditionRemplie = true;
            if (op === '!=' && valeurActuelle !== seuil) conditionRemplie = true;

            if (conditionRemplie) {
                console.log(`[AUTOMATION] Règle "${regle.nomRegle}" validée par le hardware !`);

                const idCible = regle.action.appareilCible.toString();
                const commandeAAffecter = regle.action.commande;
                const isCommandeOn = commandeAAffecter === 'ON';

                const appareilCibleMAJ = await Appareil.findByIdAndUpdate(
                    idCible,
                    {
                        status: isCommandeOn ? 'ENLIGNE' : 'HORSLIGNE',
                        consommationActuelle: isCommandeOn ? 65 : 0
                    },
                    { new: true }
                );

                if (appareilCibleMAJ) {
                    if (client && client.connected) {
                        client.publish(TOPIC_COMMANDES, JSON.stringify({
                            deviceId: idCible,
                            action: "TOGGLE",
                            valeur: isCommandeOn
                        }));
                        console.log(`[MQTT PUSH] Ordre automatique envoyé à l'appareil ${idCible} => ${commandeAAffecter}`);
                    }

                    if (io) {
                        // Émettre uniquement dans les rooms des utilisateurs concernés
                        try {
                            const userIds = await getUsersForPiece(appareilCibleMAJ.piece);
                            const rooms = userRoomNames(userIds);
                            rooms.forEach(room => io.to(room).emit('appareil_update', {
                                deviceId: idCible,
                                payload: {
                                    status: appareilCibleMAJ.status,
                                    consommationActuelle: appareilCibleMAJ.consommationActuelle
                                }
                            }));
                        } catch (roomErr) {
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
        }
    } catch (err) {
        console.error("Erreur au niveau du moteur d'automatisation (Regles) :", err.message);
    }
}

/**
 * RECALCUL DE L'ÉNERGIE PAR MAISON (scopé par utilisateur)
 * Calcule la consommation totale uniquement pour les appareils de la maison
 * et émet le résultat dans les rooms Socket.IO des utilisateurs concernés.
 */
async function recalculerEnergieParMaison(pieceId, io) {
    try {
        const Piece = require('../models/Piece');
        const Maison = require('../models/Maison');

        const piece = await Piece.findById(pieceId).select('maison');
        if (!piece) return;

        const maison = await Maison.findById(piece.maison).select('proprietaire membres');
        if (!maison) return;

        // Trouver toutes les pièces de cette maison
        const piecesMaison = await Piece.find({ maison: maison._id }, '_id');
        const pieceIds = piecesMaison.map(p => p._id);

        // Calculer la consommation cumulée uniquement pour cette maison
        const appareils = await Appareil.find({ piece: { $in: pieceIds } });
        const total = appareils.reduce((s, a) => s + (a.consommationCumulee || 0), 0);
        const totalWatts = appareils
            .filter(a => a.status === 'ENLIGNE')
            .reduce((s, a) => s + (a.consommationActuelle || 0), 0);

        // Émettre uniquement aux utilisateurs de cette maison
        const userIds = [maison.proprietaire.toString()];
        if (maison.membres) userIds.push(...maison.membres.map(m => m.toString()));
        const rooms = userRoomNames([...new Set(userIds)]);

        if (io) {
            rooms.forEach(room => {
                io.to(room).emit('global_energy_update', {
                    consommationTotale: Math.round(total * 100) / 100,
                    totalWattsActuels: Math.round(totalWatts),
                    balanceEnergetique: 0
                });
            });
        }

    } catch (err) {
        console.error("Erreur recalcul par maison :", err.message);
    }
}

/**
 * ENVOI FLUSH DE SÉCURITÉ MQTT (PUBLISH)
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
