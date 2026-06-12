const cron = require('node-cron');
const mongoose = require('mongoose');

// Chargement sécurisé des modèles Mongoose pour éviter les erreurs de redondance
const Appareil = mongoose.model('Appareil');
const SystemeGestionEnergetique = mongoose.model('SystemeGestionEnergetique');
const HistoriqueConsommation = mongoose.model('HistoriqueConsommation');
const Notification = mongoose.model('Notification'); 
const Planification = require('../models/Planification'); // 💡 Importation du modèle Planification

const { resetLocalConsumptionCache, publishMqttMessage } = require('../config/mqttService'); // 💡 Récupération sécurisée du client MQTT
const { getIO } = require('../config/socket');

// Topic central identique pour l'envoi des ordres matériels
const TOPIC_COMMANDES = 'smart/home/appareils/commandes';

/**
 * 📅 CRON SERVICE 1 : Réinitialisation mensuelle et archivage de fin de mois
 * Fréquence : S'exécute automatiquement chaque 1er jour du mois à 00:00 (Minuit pile)
 */
const initializeMonthlyResetCron = () => {
    console.log("⏰ Service CRON activé : Surveillance du reset mensuel en cours...");

    cron.schedule('0 0 1 * *', async () => {
        console.log("🔄 [CRON] Début du reset mensuel + archivage des données...");

        try {
            const now = new Date();
            const indexMoisPrecedent = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const anneePrecedente = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
            const numeroMoisHumain = indexMoisPrecedent + 1;

            const systeme = await SystemeGestionEnergetique.findOne({});

            if (systeme) {
                const nouvelleArchive = await HistoriqueConsommation.create({
                    annee: anneePrecedente,
                    mois: numeroMoisHumain,
                    consommationMensuelle: systeme.consommationTotale || 0,
                    productionMensuelle: systeme.productionTotale || 0,
                    factureEstimee: (systeme.consommationTotale || 0) * (systeme.prixKWh || 0)
                });

                console.log(`💾 [CRON] Archivage réussi pour le mois ${numeroMoisHumain}/${anneePrecedente} | Archive ID: ${nouvelleArchive._id}`);

                try {
                    await Notification.create({
                        titre: "🧾 Nouveau bilan disponible",
                        message: `Le rapport du mois ${numeroMoisHumain}/${anneePrecedente} est prêt. Facture estimée : ${nouvelleArchive.factureEstimee.toFixed(2)} DH.`,
                        type: "INFO",
                        estLue: false,
                        utilisateur: systeme.utilisateurPrincipal || "65a123456789abcdef012345"
                    });
                    console.log("🔔 [CRON] Notification de fin de mois enregistrée en base de données.");
                } catch (notifError) {
                    console.warn("⚠️ [CRON WARN] Échec de la création de la notification :", notifError.message);
                }

            } else {
                console.warn("⚠️ [CRON WARN] Aucun document énergétique global trouvé pour l'archivage.");
            }

            await Appareil.updateMany({}, { $set: { consommationCumulee: 0 } });
            console.log("✅ [CRON] Consommation cumulée de tous les appareils réinitialisée à 0.");

            await SystemeGestionEnergetique.updateMany(
                {},
                {
                    $set: {
                        consommationTotale: 0,
                        balanceEnergetique: 0,
                        dateDerniereMiseAJour: new Date()
                    }
                }
            );

            console.log("✅ [CRON] Tableau de bord énergétique global réinitialisé.");

            setTimeout(() => {
                if (typeof resetLocalConsumptionCache === 'function') {
                    resetLocalConsumptionCache();
                    console.log("🧹 [CRON] Cache RAM de l'instance MQTT nettoyé avec succès.");
                }
            }, 500);

            const io = getIO();
            if (io) {
                io.emit('global_energy_update', { consommationTotale: 0, balanceEnergetique: 0 });
                io.emit('new_notification', { message: "Un nouveau bilan énergétique mensuel est disponible !" });
                console.log("📡 [CRON] Notification de remise à zéro poussée vers Socket.IO.");
            }

            console.log("🎉 [CRON] Le cycle de reset mensuel s'est déroulé avec succès !");

        } catch (error) {
            console.error("❌ [CRON ERROR] Échec critique durant le reset mensuel :", error.message);
        }
    });
};

/**
 * 📅 💡 CRON SERVICE 2 : Moteur d'automatisation temporelle (Planifications)
 * Fréquence : S'exécute automatiquement TOUTES LES MINUTES (* * * * *)
 * Objectif : Parcourir les plannings actifs, vérifier le jour/heure et envoyer l'ordre MQTT approprié
 */
const initializePlanningCron = () => {
    console.log("⏰ Service CRON activé : Moteur de planification temporelle en écoute (* * * * *)...");

    cron.schedule('* * * * *', async () => {
        try {
            // 1️⃣ Récupération du temps actuel système (Heure, Minute, Jour de la semaine en Français)
            const maintenant = new Date();
            
            // Formatage de l'heure actuelle en format HH:MM string (ex: "08:30")
            const heureActuelleStr = `${String(maintenant.getHours()).padStart(2, '0')}:${String(maintenant.getMinutes()).padStart(2, '0')}`;
            
            // Mapping du jour actuel vers l'enum français défini dans le modèle Planification
            const joursFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
            const jourActuelFr = joursFr[maintenant.getDay()];

            // 2️⃣ Recherche de tous les plannings actifs f الداتابيز
            const planningsActifs = await Planification.find({ estActive: true });
            
            const io = getIO();

            for (let plan of planningsActifs) {
                // Vérification si le planning cible le jour actuel (ou s'il se répète tous les jours si le tableau est vide)
                const jourCorrespondant = plan.jourRepetition.length === 0 || plan.jourRepetition.includes(jourActuelFr);
                
                if (!jourCorrespondant) continue;

                let actionAFaire = null;

                // Évaluation si c'est l'heure exacte de démarrage (Allumage)
                if (plan.heureDebut === heureActuelleStr) {
                    actionAFaire = 'ON';
                } 
                // Évaluation si c'est l'heure exacte d'arrêt (Extinction)
                else if (plan.heureFin === heureActuelleStr) {
                    actionAFaire = 'OFF';
                }

                // 3️⃣ Si une correspondance horaire stricte est validée, exécution de la commande hardware
                if (actionAFaire) {
                    const idAppareilStr = plan.idAppareil.toString();
                    const isTurnOn = actionAFaire === 'ON';

                    console.log(`⏱️ [CRON AUTOMATION] Exécution du plan "${plan.nomPlan || 'Sans Nom'}" pour l'appareil ${idAppareilStr} => Action: ${actionAFaire}`);

                    // 🛠️ Mise à jour immédiate de l'état du matériel dans MongoDB
                    const appareilMisAJour = await Appareil.findByIdAndUpdate(
                        idAppareilStr,
                        { 
                            status: isTurnOn ? 'ENLIGNE' : 'HORSLIGNE',
                            consommationActuelle: isTurnOn ? 45 : 0 // Injection d'une charge fictive standard
                        },
                        { new: true }
                    );

                    if (appareilMisAJour) {
                        // 🛠️ Publication de l'ordre sur le Broker MQTT pour l'ESP32 Réel (Wokwi) ou Virtuel (fakeEsp32)
                        publishMqttMessage(TOPIC_COMMANDES, JSON.stringify({
                            deviceId: idAppareilStr,
                            action: "TOGGLE",
                            valeur: isTurnOn
                        }));

                        // 🛠️ Émission instantanée Socket.io pour basculer le switch sur l'interface React
                        if (io) {
                            io.emit('appareil_update', {
                                deviceId: idAppareilStr,
                                payload: {
                                    status: appareilMisAJour.status,
                                    consommationActuelle: appareilMisAJour.consommationActuelle
                                }
                            });
                        }
                    }
                }
            }
        } catch (error) {
            console.error("❌ [CRON ERROR] Échec lors de l'évaluation des planifications :", error.message);
        }
    });
};

// Exportation groupée des deux services de surveillance
module.exports = { 
    initializeMonthlyResetCron,
    initializePlanningCron 
};