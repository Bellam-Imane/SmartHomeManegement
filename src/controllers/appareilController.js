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
    // 💡 Note : On stocke typeAppareil et type pour assurer une compatibilité totale
    let appareilData = {
      nomAppareil,
      typeAppareil: typeAppareil.toUpperCase(),
      type: typeAppareil.toUpperCase(), 
      piece,
      userId: req.user.id,
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
exports.updateAppareil = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = { ...req.body };
    delete updateData._id;

    // 💡 CORRECTIF EXCLUSIF : Recherche par ID uniquement car le modèle actuel ne contient pas userId
    const appareil = await Appareil.findById(id);
    if (!appareil) {
      return res.status(404).json({ success: false, message: "Appareil introuvable" });
    }

    // 💡 Lecture unifiée du type (gère 'type' ou 'typeAppareil')
    const type = (appareil.type || appareil.typeAppareil || req.body.type || "").toUpperCase();

    // Logique multimédia pour temps d'utilisation
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

    // Sauvegarde DB via ID de manière générique et fluide
    const updated = await Appareil.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    const isEnLigne = updated.status === 'ENLIGNE';

    // ─────────────────────────────────────────────
    // MQTT COMMANDES (ESP32 CENTRAL TOPIC)
    // ─────────────────────────────────────────────
    const TOPIC_COMMANDES = 'smart/home/appareils/commandes';

    const basePayload = {
      deviceId: id,
      type: type, 
      action: "TOGGLE",
      valeur: isEnLigne,
      data: {}
    };

    if (type === 'ECLAIRAGE') basePayload.data = { intensite: updated.intensite || 100 };
    else if (type === 'CAMERA') basePayload.data = { recording: updated.estEnregistrement || false };
    else if (type === 'ASPIRATEUR') basePayload.data = { mode: updated.modeNettoyage };
    else if (type === 'THERMIQUE') basePayload.data = { mode: updated.mode, temperature: updated.temperatureCible };
    else if (type === 'MOTORISE') basePayload.data = { pourcentage: updated.pourcentageOuverture };
    else if (type === 'MULTIMEDIA') {
      basePayload.data = {
        app: updated.application,
        volume: updated.volume,
        play: updated.lectureActive
      };
    }

    // Envoi immédiat au format JSON stringifié pour Wokwi
    mqttService.publish(TOPIC_COMMANDES, JSON.stringify(basePayload));

    // ─────────────────────────────────────────────
    // MQTT SIMULATOR (COMPATIBILITÉ ANCIEN FLUX)
    // ─────────────────────────────────────────────
    const deviceTopic = `smart/home/appareil/${id}`;
    let simplePayload = "OFF";

    if (isEnLigne) {
      if (type === 'ECLAIRAGE' || type === 'ASPIRATEUR' || type === 'THERMIQUE') {
        simplePayload = "ON";
      } else if (type === 'CAMERA') {
        simplePayload = updated.estEnregistrement ? "REC" : "ON";
      } else if (type === 'MOTORISE') {
        simplePayload = (updated.pourcentageOuverture ?? 100).toString();
      } else if (type === 'MULTIMEDIA') {
        if (updated.application === 'NETFLIX') simplePayload = "NETFLIX";
        else if (updated.application === 'SPOTIFY') simplePayload = "SPOTIFY";
        else simplePayload = "ON";
      } else {
        simplePayload = "ON";
      }
    } else {
      simplePayload = (type === 'MOTORISE') ? "0" : "OFF";
    }
    
    mqttService.publish(deviceTopic, simplePayload);

    console.log(`📤 MQTT SENT -> ${TOPIC_COMMANDES} (Type: ${type}, Status: ${updated.status})`);

    return res.json({
      success: true,
      message: "Appareil mis à jour et commandes MQTT synchronisées",
      data: updated
    });

  } catch (error) {
    console.error("❌ Erreur de mise à jour :", error.message);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * ---------------------------------------------------------------------------------
 * CONTROLLER : RÉCUPÉRER TOUS LES APPAREILS
 * ---------------------------------------------------------------------------------
 */
exports.getAllAppareils = async (req, res) => {
  try {
    // Note: On récupère temporairement tous les appareils pour s'assurer de l'affichage complet sans blocage de clé
    const appareils = await Appareil.find({}).populate({
      path: 'piece',
      select: 'nomPiece' 
    });

    return res.status(200).json({
      success: true,
      count: appareils.length,
      data: appareils
    });
  } catch (error) {
    console.error("❌ Erreur dans fonction [getAllAppareils]:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la récupération des appareils.",
      error: error.message
    });
  }
};