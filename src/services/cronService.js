const cron = require('node-cron');
const mongoose = require('mongoose');

// Chargement sécurisé des modèles Mongoose pour éviter les erreurs de redondance
const Appareil = mongoose.model('Appareil');
const SystemeGestionEnergetique = mongoose.model('SystemeGestionEnergetique');
const HistoriqueConsommation = mongoose.model('HistoriqueConsommation');
const Notification = mongoose.model('Notification'); // Ajout du modèle Notification

const { resetLocalConsumptionCache } = require('../config/mqttService');
const { getIO } = require('../config/socket');

/**
 * 📅 CRON SERVICE : Réinitialisation mensuelle et archivage de fin de mois
 * Fréquence : S'exécute automatiquement chaque 1er jour du mois à 00:00 (Minuit pile)
 * Objectif : Sauvegarder le cumul mensuel (Wh) et préparer les compteurs pour le nouveau mois
 */
const initializeMonthlyResetCron = () => {
    console.log("⏰ Service CRON activé : Surveillance du reset mensuel en cours...");

    // Planification standard : '0 0 1 * *' (Minuit, premier jour de chaque mois)
    cron.schedule('0 0 1 * *', async () => {
        console.log("🔄 [CRON] Début du reset mensuel + archivage des données...");

        try {
            // ======================================================
            // 1️⃣ CALCUL SÉCURISÉ DU MOIS ET DE L'ANNÉE À ARCHIVER
            // ======================================================
            const now = new Date();
            
            // Décalage pour cibler le mois qui vient de s'achever (0 = Janvier, 11 = Décembre)
            const indexMoisPrecedent = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
            const anneePrecedente = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

            // Conversion en index humain standardisé (1 pour Janvier, 12 pour Décembre)
            const numeroMoisHumain = indexMoisPrecedent + 1;

            // ======================================================
            // 2️⃣ RÉCUPÉRATION DU BILAN ÉNERGÉTIQUE GLOBAL DU MOIS
            // ======================================================
            const systeme = await SystemeGestionEnergetique.findOne({});

            if (systeme) {
                // ======================================================
                // 3️⃣ CRÉATION DE L'ARCHIVE DANS HISTORIQUE_CONSOMMATION
                // ======================================================
                const nouvelleArchive = await HistoriqueConsommation.create({
                    annee: anneePrecedente,
                    mois: numeroMoisHumain, // Stockage du mois réel (ex: 5 pour Mai)
                    consommationMensuelle: systeme.consommationTotale || 0,
                    productionMensuelle: systeme.productionTotale || 0,
                    // Calcul de la facture estimée basé sur le prix unitaire du kWh enregistré
                    factureEstimee: (systeme.consommationTotale || 0) * (systeme.prixKWh || 0)
                });

                console.log(`💾 [CRON] Archivage réussi pour le mois ${numeroMoisHumain}/${anneePrecedente} | Archive ID: ${nouvelleArchive._id}`);

                // ======================================================
                // 3️⃣b️⃣ GÉNÉRATION AUTOMATIQUE DE LA NOTIFICATION SYSTEME
                // ======================================================
                try {
                    await Notification.create({
                        titre: "🧾 Nouveau bilan disponible",
                        message: `Le rapport du mois ${numeroMoisHumain}/${anneePrecedente} est prêt. Facture estimée : ${nouvelleArchive.factureEstimee.toFixed(2)} DH.`,
                        type: "INFO",
                        estLue: false,
                        utilisateur: systeme.utilisateurPrincipal || "65a123456789abcdef012345" // ATTENTION: Remplacez par le champ ID réel de votre admin/user principal si disponible
                    });
                    console.log("🔔 [CRON] Notification de fin de mois enregistrée en base de données.");
                } catch (notifError) {
                    console.warn("⚠️ [CRON WARN] Échec de la création de la notification :", notifError.message);
                }

            } else {
                console.warn("⚠️ [CRON WARN] Aucun document énergétique global trouvé pour l'archivage.");
            }

            // ======================================================
            // 4️⃣ RÉINITIALISATION DU CUMULÉ DE CHAQUE APPAREIL
            // ======================================================
            // Remise à zéro uniquement de la 'consommationCumulee' pour le nouveau mois.
            // La 'consommationActuelle' (W) reste intacte car gérée en direct par l'ESP32.
            await Appareil.updateMany(
                {},
                { $set: { consommationCumulee: 0 } }
            );

            console.log("✅ [CRON] Consommation cumulée de tous les appareils réinitialisée à 0.");

            // ======================================================
            // 5️⃣ RÉINITIALISATION DU TABLEAU DE BORD GLOBAL (MAISON)
            // ======================================================
            // Correction syntaxique de l'objet de mise à jour (Correction du bug de crash)
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

            // ======================================================
            // 6️⃣ NETTOYAGE DU CACHE RAM DE L'INSTANCE MQTT
            // ======================================================
            setTimeout(() => {
                if (typeof resetLocalConsumptionCache === 'function') {
                    resetLocalConsumptionCache();
                    console.log("🧹 [CRON] Cache RAM de l'instance MQTT nettoyé avec succès.");
                }
            }, 500);

            // ======================================================
            // 7️⃣ SYNCHRONISATION EN TEMPS RÉEL AVEC REACT (SOCKET.IO)
            // ======================================================
            const io = getIO();

            if (io) {
                // Envoi flash pour mettre à jour les compteurs du Dashboard sans rafraîchissement
                io.emit('global_energy_update', {
                    consommationTotale: 0,
                    balanceEnergetique: 0
                });

                // Envoi d'un signal en temps réel pour alerter le client de la nouvelle notification
                io.emit('new_notification', {
                    message: "Un nouveau bilan énergétique mensuel est disponible !"
                });

                console.log("📡 [CRON] Notification de remise à zéro poussée vers Socket.IO.");
            }

            console.log("🎉 [CRON] Le cycle de reset mensuel s'est déroulé avec succès !");

        } catch (error) {
            // Gestion et traçabilité des erreurs critiques pour éviter le blocage du serveur
            console.error("❌ [CRON ERROR] Échec critique durant le reset mensuel :", error.message);
        }
    });
};

module.exports = { initializeMonthlyResetCron };