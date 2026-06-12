const {
  Appareil,
  AppareilEclairage,
  AppareilThermique,
  AppareilMultimedia,
  AppareilMotorise,
  Camera,
  PorteIntelligent,
  Capteur,
  Aspirateur
} = require('../models/Appareil');

const Piece = require('../models/Piece');
const { publishMessage } = require('../config/mqttService');
const { logDeviceEvent } = require('../services/historyService');

/**
 * ---------------------------------------------------------------------------------
 * CONTROLLER : CREATION ET AJOUT D'UN NOUVEL APPAREIL DOMOTIQUE
 * ---------------------------------------------------------------------------------
 */
exports.createAppareil = async (req, res) => {
  try {
    const { nomAppareil, typeAppareil, piece, marque } = req.body;

    // Verification des champs obligatoires
    if (!nomAppareil || !typeAppareil || !piece) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir le nom, le type de l'appareil et la piece associee."
      });
    }

    // Preparation des donnees de base de l'appareil
    let appareilData = {
      nomAppareil,
      typeAppareil: typeAppareil.toUpperCase(),
      type: typeAppareil.toUpperCase(),
      piece,
      userId: req.user.id,
      marque: marque || "",
      status: "HORSLIGNE"
    };

    // Initialisation des proprietes specifiques selon le type d'appareil
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
      appareilData.chaineActuelle = 1;
      appareilData.dernierAllumage = null;
      appareilData.tempsUtilisationTotal = 0;
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

    // Instanciation du bon sous-modele Mongoose selon le discriminateur
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

    // Sauvegarde de l'appareil dans la base de donnees
    await nouvelAppareil.save();

    // Liaison automatique de l'appareil cree au tableau de la piece correspondante
    try {
      await Piece.findByIdAndUpdate(piece, {
        $push: { appareils: nouvelAppareil._id }
      });
      console.log(`Appareil lie a la piece ${piece} avec succes.`);
    } catch (pieceError) {
      console.error("Impossible de lier l'appareil au tableau de la piece:", pieceError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Appareil ajoute avec succes !",
      data: nouvelAppareil
    });

  } catch (error) {
    console.error("Erreur critique dans fonction [createAppareil]:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'ajout de l'appareil.",
      error: error.message
    });
  }
};


/**
 * ---------------------------------------------------------------------------------
 * CONTROLLER : MISE A JOUR DES PROPRIETES D'UN APPAREIL CONNECTE EXISTANT
 * ---------------------------------------------------------------------------------
 */
exports.updateAppareil = async (req, res) => {
  try {
    const { id } = req.params;

    // Clonage du corps de la requete et suppression des cles immuables pour Mongoose
    const updateData = { ...req.body };
    delete updateData.typeAppareil;
    delete updateData._id;
    delete updateData.id;

    // Verification de l'existence de l'appareil avant modification
    const appareilExiste = await Appareil.findById(id);
    if (!appareilExiste) {
      return res.status(404).json({
        success: false,
        message: "L'appareil demande est introuvable."
      });
    }

    const typeReel = appareilExiste.typeAppareil?.toUpperCase();

    // Capture de l'etat avant modification pour l'historique PostgreSQL
    const ancienStatus = appareilExiste.status;

    console.log(`[DEBUG] ID: ${id} | typeReel: "${typeReel}" | updateData:`, JSON.stringify(updateData));

    // LOGIQUE CHRONOMETRE : Calcul du temps de visionnage pour les appareils MULTIMEDIA
    if (typeReel === 'MULTIMEDIA') {
      const maintenant = new Date();
      const nouveauStatus = updateData.status || appareilExiste.status;

      // Cas 1 : L'appareil s'allume (ENLIGNE) ou change d'application -> On enregistre l'heure de debut
      if (nouveauStatus === 'ENLIGNE' && (appareilExiste.status === 'HORSLIGNE' || updateData.application !== undefined)) {
        updateData.dernierAllumage = maintenant;
      }
      // Cas 2 : L'appareil s'eteint (HORSLIGNE) -> On calcule la duree et on l'ajoute au total cumule
      else if (nouveauStatus === 'HORSLIGNE' && appareilExiste.status === 'ENLIGNE' && appareilExiste.dernierAllumage) {
        const tempsPasseMs = maintenant - new Date(appareilExiste.dernierAllumage);
        const tempsPasseMinutes = Math.round(tempsPasseMs / 1000 / 60);

        // Cumul du temps passe et reinitialisation du marqueur de debut
        updateData.tempsUtilisationTotal = (appareilExiste.tempsUtilisationTotal || 0) + tempsPasseMinutes;
        updateData.dernierAllumage = null;
      }
    }

    // Selection dynamique du sous-modele pour appliquer la mise a jour en BDD
    let appareilModifie;
    if (typeReel === 'ASPIRATEUR') {
      appareilModifie = await Aspirateur.findByIdAndUpdate(
        id,
        { $set: updateData },
        { returnDocument: 'after', runValidators: false }
      );
    } else if (typeReel === 'MULTIMEDIA') {
      appareilModifie = await AppareilMultimedia.findByIdAndUpdate(
        id,
        { $set: updateData },
        { returnDocument: 'after', runValidators: false }
      );
    } else {
      appareilModifie = await Appareil.findByIdAndUpdate(
        id,
        { $set: updateData },
        { returnDocument: 'after', runValidators: false }
      );
    }

    if (!appareilModifie) {
      return res.status(400).json({
        success: false,
        message: "Echec de la mise a jour de l'appareil dans la base de donnees."
      });
    }

    // Historisation PostgreSQL si le status a change
    console.log(`[DEBUG] Phase4 Check -> ancienStatus: "${ancienStatus}" | nouveauStatus: "${appareilModifie.status}"`);
    if (ancienStatus !== appareilModifie.status) {
      console.log(`[DEBUG] Phase4 -> Status changed. Logging to PostgreSQL...`);
      await logDeviceEvent(id, 'CHANGEMENT_ETAT', ancienStatus, appareilModifie.status);
      console.log(`[DEBUG] Phase4 -> PostgreSQL log completed.`);
    } else {
      console.log(`[DEBUG] Phase4 -> Status unchanged. Skipping PostgreSQL log.`);
    }

    // Definition du canal MQTT unique base sur l'ID de l'appareil
    const deviceTopic = `smart/home/appareil/${id}`;

    // --- MQTT : ECLAIRAGE (Format -> STATUS:INTENSITE) ---
    if (typeReel === 'ECLAIRAGE') {
      const statusPayload = appareilModifie.status === 'ENLIGNE' ? 'ON' : 'OFF';
      const intensityPayload = appareilModifie.intensite !== undefined ? appareilModifie.intensite : 100;
      const finalPayload = `${statusPayload}:${intensityPayload}`;

      console.log(`[MQTT - ECLAIRAGE] Topic: ${deviceTopic} | Payload: ${finalPayload}`);
      publishMessage(deviceTopic, finalPayload);
    }

    // --- MQTT : CAMERA (Format -> STATUS:ENREGISTREMENT) ---
    else if (typeReel === 'CAMERA') {
      const currentStatus = updateData.status || appareilModifie.status;
      const statusPayload = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';

      const isRecordingActive =
        updateData.estEnregistrement === true ||
        appareilModifie.estEnregistrement === true;

      const recPayload = isRecordingActive ? 'REC' : 'NO_REC';
      const cameraPayload = `${statusPayload}:${recPayload}`;

      console.log(`[MQTT - CAMERA] Topic: ${deviceTopic} | Payload: ${cameraPayload}`);
      publishMessage(deviceTopic, cameraPayload);
    }

    // --- MQTT : ASPIRATEUR (Format -> STATUS:MODE) ---
    else if (typeReel === 'ASPIRATEUR') {
      const currentStatus = updateData.status || appareilModifie.status;
      const statusPayload = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const currentMode = appareilModifie.modeNettoyage || 'STANDARD';
      const modePayload = currentMode.toUpperCase();
      const vacuumPayload = `${statusPayload}:${modePayload}`;

      console.log(`[MQTT - ASPIRATEUR] Topic: ${deviceTopic} | Payload: ${vacuumPayload}`);
      publishMessage(deviceTopic, vacuumPayload);
    }

    // --- MQTT : CLIMATISEUR THERMIQUE (Format -> STATUS:MODE:TEMPERATURE) ---
    else if (typeReel === 'THERMIQUE') {
      const currentStatus = updateData.status || appareilModifie.status;
      const statusPayload = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const currentMode = appareilModifie.mode || 'AUTO';
      const modePayload = currentMode.toUpperCase();
      const currentCible = appareilModifie.temperatureCible || 24;
      const climaPayload = `${statusPayload}:${modePayload}:${currentCible}`;

      console.log(`[MQTT - THERMIQUE] Topic: ${deviceTopic} | Payload: ${climaPayload}`);
      publishMessage(deviceTopic, climaPayload);
    }

    // --- MQTT : RIDEAUX MOTORISES (Format -> STATUS:MODE:POURCENTAGE) ---
    else if (typeReel === 'MOTORISE') {
      const currentStatus = updateData.status || appareilModifie.status;
      const statusPayload = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const currentMode = appareilModifie.mode || 'Ombrage automatique';
      const modePayload = currentMode.toUpperCase();
      const pourcentage = appareilModifie.pourcentageOuverture ?? 0;
      const rideauxPayload = `${statusPayload}:${modePayload}:${pourcentage}`;

      console.log(`[MQTT - MOTORISE] Topic: ${deviceTopic} | Payload: ${rideauxPayload}`);
      publishMessage(deviceTopic, rideauxPayload);
    }

    // --- MQTT : MULTIMEDIA (Format -> STATUS:APPLICATION:VOLUME:CHAINE:LECTURE) ---
    else if (typeReel === 'MULTIMEDIA') {
      const currentStatus = updateData.status || appareilModifie.status;
      const statusPayload = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const currentApp = updateData.application || appareilModifie.application || 'NONE';
      const appPayload = currentApp.toUpperCase();
      const currentVolume = appareilModifie.estMuet ? 0 : (appareilModifie.volume ?? 20);
      const currentChannel = appareilModifie.chaineActuelle || 1;

      // Variable pour gerer l'etat de Lecture / Pause (PLAY ou PAUSE)
      const isPlaying = (appareilModifie.lectureActive !== false);
      const currentLecture = isPlaying ? "PLAY" : "PAUSE";

      // Construction du Payload final incluant le nouvel argument de lecture
      const multimediaPayload = `${statusPayload}:${appPayload}:${currentVolume}:${currentChannel}:${currentLecture}`;

      console.log(`[MQTT - MULTIMEDIA] Topic: ${deviceTopic}`);
      console.log(`[ETAT VIDEO]      : ${isPlaying ? 'PLAY (En cours de lecture)' : 'PAUSE (Arrete)'}`);
      console.log(`[PAYLOAD ENVOYE]  : ${multimediaPayload}`);

      publishMessage(deviceTopic, multimediaPayload);
    }

    return res.status(200).json({
      success: true,
      message: "Appareil mis a jour avec succes !",
      data: appareilModifie
    });

  } catch (error) {
    console.error("Erreur interne dans fonction [updateAppareil]:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur interne du serveur est survenue.",
      error: error.message
    });
  }
};

/**
 * ---------------------------------------------------------------------------------
 * CONTROLLER : RECUPERER TOUS LES APPAREILS
 * ---------------------------------------------------------------------------------
 */
exports.getAllAppareils = async (req, res) => {
  try {
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
    console.error("Erreur dans fonction [getAllAppareils]:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la recuperation des appareils.",
      error: error.message
    });
  }
};
