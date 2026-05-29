const { 
    Appareil, 
    AppareilEclairage, 
    AppareilThermique, 
    AppareilMultimedia, 
    AppareilMotorise, 
    Camera, 
    Aspirateur 
} = require('../models/Appareil'); 

const Piece = require('../models/Piece');

// ⚠️ IMPORTANT : service MQTT centralisé
const mqttService = require('../config/mqttService');


/**
 * ---------------------------------------------------------------------------------
 * CREATE APPAREIL
 * ---------------------------------------------------------------------------------
 */
exports.createAppareil = async (req, res) => {
  try {
    const { nomAppareil, typeAppareil, piece, marque } = req.body;

    // Vérification des champs obligatoires
    if (!nomAppareil || !typeAppareil || !piece) {
      return res.status(400).json({
        success: false,
        message: "Champs obligatoires manquants"
      });
    }

    // Structure de base de l'appareil
    let appareilData = {
      nomAppareil,
      typeAppareil,
      piece,
      marque: marque || "",
      status: "HORSLIGNE"
    };

    // Initialisation selon type
    if (typeAppareil === 'ECLAIRAGE') {
      appareilData.intensite = 100;
      appareilData.couleur = '#FFFFFF';

    } else if (typeAppareil === 'THERMIQUE') {
      appareilData.temperatureActuelle = 22;
      appareilData.temperatureCible = 24;
      appareilData.mode = 'AUTO';

    } else if (typeAppareil === 'MULTIMEDIA') {
      appareilData.volume = 20;
      appareilData.source = 'HDMI';
      appareilData.application = 'NONE';
      appareilData.lectureActive = true;

    } else if (typeAppareil === 'MOTORISE') {
      appareilData.pourcentageOuverture = 0;
      appareilData.estVerrouille = true;

    } else if (typeAppareil === 'ASPIRATEUR') {
      appareilData.chargeBatterie = 100;
      appareilData.modeNettoyage = 'STANDARD';

    } else if (typeAppareil === 'CAMERA') {
      appareilData.niveauSensibilite = 'MEDIUM';
      appareilData.estDeclanche = false;
    }

    // Création du modèle correspondant
    let nouvelAppareil;
    switch (typeAppareil?.toUpperCase()) {
      case 'ECLAIRAGE':  nouvelAppareil = new AppareilEclairage(appareilData); break;
      case 'THERMIQUE':  nouvelAppareil = new AppareilThermique(appareilData); break;
      case 'MULTIMEDIA': nouvelAppareil = new AppareilMultimedia(appareilData); break;
      case 'MOTORISE':   nouvelAppareil = new AppareilMotorise(appareilData); break;
      case 'ASPIRATEUR': nouvelAppareil = new Aspirateur(appareilData); break;
      case 'CAMERA':     nouvelAppareil = new Camera(appareilData); break;
      default:           nouvelAppareil = new Appareil(appareilData);
    }

    await nouvelAppareil.save();

    // liaison pièce
    await Piece.findByIdAndUpdate(piece, {
      $push: { appareils: nouvelAppareil._id }
    });

    return res.status(201).json({
      success: true,
      message: "Appareil créé avec succès",
      data: nouvelAppareil
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};


/**
 * ---------------------------------------------------------------------------------
 * UPDATE APPAREIL + MQTT SYNC (FORMAT UNIFIÉ)
 * ---------------------------------------------------------------------------------
 */
/**
 * ---------------------------------------------------------------------------------
 * UPDATE APPAREIL + MQTT SYNC (COMPATIBLE 100% AVEC LE FAKE ESP32)
 * ---------------------------------------------------------------------------------
 */
exports.updateAppareil = async (req, res) => {
  try {

    const debugApps = await Appareil.find({}, 'nomAppareil typeAppareil');
    console.log("=== 📋 ها هما الـ IDs ديال الأجهزة ديالك : ===");
    console.log(JSON.stringify(debugApps, null, 2));
    console.log("===============================================");

    





    const { id } = req.params;

    // Protection des champs sensibles
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.typeAppareil;

    const appareil = await Appareil.findById(id);

    if (!appareil) {
      return res.status(404).json({
        success: false,
        message: "Appareil introuvable"
      });
    }

    const type = appareil.typeAppareil?.toUpperCase();

    /**
     * ⏱️ LOGIQUE MULTIMÉDIA (Temps d'utilisation)
     */
    if (type === 'MULTIMEDIA') {
      const now = new Date();

      if (updateData.status === 'ENLIGNE' && appareil.status === 'HORSLIGNE') {
        updateData.dernierAllumage = now;
      }

      if (updateData.status === 'HORSLIGNE' && appareil.dernierAllumage) {
        const diff = now - new Date(appareil.dernierAllumage);
        const minutes = Math.round(diff / 60000);

        updateData.tempsUtilisationTotal = (appareil.tempsUtilisationTotal || 0) + minutes;
        updateData.dernierAllumage = null;
      }
    }

    /**
     * UPDATE DB
     */
    const updated = await Appareil.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true } // Correction du warning de dépréciation {new: true}
    );

    /**
     * =========================================================
     * 📡 CORRECTION CRITIQUE MQTT : ALIGNEMENT SUR LE FAKE ESP32
     * =========================================================
     */
    
    // 1️⃣ TOPIC CENTRALISÉ : Utilisation du canal unique écouté par le Fake ESP32
    const TOPIC_COMMANDES = 'smart/home/appareils/commandes';

    // 2️⃣ PAYLOAD HARMONISÉ : Traduction du statut en action claire pour le script de l'ESP32
    // Le Fake ESP32 bascule l'état interne (RAM) lorsque l'action reçue est "TOGGLE" ou liée au statut
    const isEnLigne = updated.status === 'ENLIGNE';

    const basePayload = {
      deviceId: id,
      type: type,
      action: "TOGGLE",               // Commande standard de bascule pour le Fake ESP32
      valeur: isEnLigne,              // true si ENLIGNE, false si HORSLIGNE
      data: {}
    };

    /**
     * 🔌 LOGIQUE DE CHARGE EXTRACT PAR TYPE D'ÉQUIPEMENT
     */
    if (type === 'ECLAIRAGE') {
      basePayload.data = { intensite: updated.intensite || 100 };
    } 
    else if (type === 'CAMERA') {
      basePayload.data = { recording: updated.estEnregistrement || false };
    } 
    else if (type === 'ASPIRATEUR') {
      basePayload.data = { mode: updated.modeNettoyage };
    } 
    else if (type === 'THERMIQUE') {
      basePayload.data = { 
        mode: updated.mode, 
        temperature: updated.temperatureCible 
      };
    } 
    else if (type === 'MOTORISE') {
      basePayload.data = { pourcentage: updated.pourcentageOuverture };
    } 
    else if (type === 'MULTIMEDIA') {
      basePayload.data = {
        app: updated.application,
        volume: updated.volume,
        channel: updated.chaineActuelle,
        play: updated.lectureActive
      };
    }

    // 📤 ENVOI DE LA COMMANDE SUR LE TOPIC CENTRAL
    mqttService.publish(TOPIC_COMMANDES, JSON.stringify(basePayload));
    console.log(`📤 [MQTT PUBLISH] Commande routée vers [${TOPIC_COMMANDES}] pour l'appareil [${id}] (Statut: ${updated.status})`);

    return res.json({
      success: true,
      message: "Appareil mis à jour et commande MQTT synchronisée",
      data: updated
    });

  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de l'appareil :", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
};