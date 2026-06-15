const {
  Appareil,
  AppareilEclairage,
  AppareilThermique,
  AppareilMultimedia,
  AppareilMotorise,
  Camera,
  PorteIntelligent,
  Capteur,
  Aspirateur,
  AppareilSecurite
} = require('../models/Appareil');

const Piece = require('../models/Piece');
const Notification = require('../models/Notifications');
const { publishMessage } = require('../config/mqttService');
const TOPIC_COMMANDES = 'smart/home/appareils/commandes';
const { logDeviceEvent } = require('../services/historyService');
const { getAppareilFilter, getUserPieceIds } = require('../utils/userScope');

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

    // SECURITE : Verifier que la piece appartient bien a la maison de l'utilisateur
    const userPieces = await getUserPieceIds(req.user.id);
    if (!userPieces.some(p => p.toString() === piece.toString())) {
      return res.status(403).json({
        success: false,
        message: "Acces refuse : cette piece n'appartient pas a votre maison."
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
    } else if (typeAppareil === 'SECURITE') {
      appareilData.niveauSensibilite = 'MEDIUM';
      appareilData.estDeclanche = false;
    } else if (typeAppareil === 'PORTE') {
      appareilData.niveauSensibilite = 'LOW';
      appareilData.estDeclanche = false;
      appareilData.estVerrouillee = true;
      appareilData.codePin = '';
    } else if (typeAppareil === 'CAPTEUR') {
      appareilData.niveauSensibilite = 'MEDIUM';
      appareilData.estDeclanche = false;
      appareilData.typeCapteur = 'MOUVEMENT';
      appareilData.valeurActuelle = 0;
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
      case 'SECURITE':   nouvelAppareil = new AppareilSecurite(appareilData); break;
      case 'PORTE':      nouvelAppareil = new PorteIntelligent(appareilData); break;
      case 'CAPTEUR':    nouvelAppareil = new Capteur(appareilData); break;
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

    // SECURITE : Verifier que l'appareil appartient a la maison de l'utilisateur
    const userPieces = await getUserPieceIds(req.user.id);
    if (!userPieces.some(p => p.toString() === appareilExiste.piece.toString())) {
      return res.status(403).json({
        success: false,
        message: "Acces refuse : cet appareil n'appartient pas a votre maison."
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

    // --- MQTT : PORTE INTELLIGENTE (Format -> STATUS:LOCK_STATE) ---
    else if (typeReel === 'PORTE') {
      const currentStatus = updateData.status || appareilModifie.status;
      const statusPayload = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const lockPayload = appareilModifie.estVerrouillee !== false ? 'LOCKED' : 'UNLOCKED';
      const porteMsg = `${statusPayload}:${lockPayload}`;

      console.log(`[MQTT - PORTE] Topic: ${deviceTopic} | Payload: ${porteMsg}`);
      publishMessage(deviceTopic, porteMsg);
    }

    // --- MQTT : SECURITE (Format -> STATUS:ARMED_STATE) ---
    else if (typeReel === 'SECURITE') {
      const currentStatus = updateData.status || appareilModifie.status;
      const statusPayload = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const armedPayload = appareilModifie.estDeclanche ? 'TRIGGERED' : 'ARMED';
      const secMsg = `${statusPayload}:${armedPayload}`;

      console.log(`[MQTT - SECURITE] Topic: ${deviceTopic} | Payload: ${secMsg}`);
      publishMessage(deviceTopic, secMsg);
    }

    // --- MQTT : CAPTEUR (Format -> STATUS:SENSOR_TYPE:VALUE) ---
    else if (typeReel === 'CAPTEUR') {
      const currentStatus = updateData.status || appareilModifie.status;
      const statusPayload = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const sensorType = (appareilModifie.typeCapteur || 'MOUVEMENT').toUpperCase();
      const sensorVal = appareilModifie.valeurActuelle || 0;
      const capteurMsg = `${statusPayload}:${sensorType}:${sensorVal}`;

      console.log(`[MQTT - CAPTEUR] Topic: ${deviceTopic} | Payload: ${capteurMsg}`);
      publishMessage(deviceTopic, capteurMsg);
    }

    // --- CENTRALIZED COMMAND (for fakeEsp32.js sync) ---
    publishMessage(TOPIC_COMMANDES, JSON.stringify({
      deviceId: id,
      action: "TOGGLE",
      valeur: appareilModifie.status === 'ENLIGNE',
      type: typeReel,
      extra: appareilModifie.estVerrouillee !== undefined ? { estVerrouillee: appareilModifie.estVerrouillee } : {}
    }));

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
 * CONTROLLER : RECUPERER TOUS LES APPAREILS (avec filtrage optionnel)
 * Query params supportes :
 *   ?type=ECLAIRAGE              -> filtre par type unique
 *   ?type=CAMERA,PORTE,CAPTEUR   -> filtre par types multiples (virgule)
 *   ?status=ENLIGNE              -> filtre par statut
 *   ?typeCapteur=MOUVEMENT       -> filtre les capteurs par sous-type
 * ---------------------------------------------------------------------------------
 */
exports.getAllAppareils = async (req, res) => {
  try {
    // SECURITE : Filtrer uniquement les appareils de la maison de l'utilisateur
    const userId = req.user.id;
    const scopeFilter = await getAppareilFilter(userId);

    const { type, status, typeCapteur } = req.query;
    const filter = { ...scopeFilter };

    // Filtrage par typeAppareil (supporte les valeurs multiples separees par virgule)
    if (type) {
      const types = type.split(',').map(t => t.trim().toUpperCase());
      filter.typeAppareil = types.length === 1 ? types[0] : { $in: types };
    }

    // Filtrage par status (ENLIGNE / HORSLIGNE)
    if (status) {
      filter.status = status.toUpperCase();
    }

    // Filtrage par sous-type de capteur (MOUVEMENT / FUMEE / HUMIDITE)
    if (typeCapteur) {
      filter.typeCapteur = typeCapteur.toUpperCase();
    }

    const appareils = await Appareil.find(filter).populate({
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

/**
 * ---------------------------------------------------------------------------------
 * CONTROLLER : SUPPRIMER UN APPAREIL
 * ---------------------------------------------------------------------------------
 */
exports.deleteAppareil = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 1. Verify device exists
    const appareil = await Appareil.findById(id);
    if (!appareil) {
      return res.status(404).json({
        success: false,
        message: "Appareil introuvable."
      });
    }

    // 2. SECURITY: Verify device belongs to user's maison
    const userPieces = await getUserPieceIds(userId);
    if (!userPieces.some(p => p.toString() === appareil.piece.toString())) {
      return res.status(403).json({
        success: false,
        message: "Accès refusé : cet appareil n'appartient pas à votre maison."
      });
    }

    const deviceName = appareil.nomAppareil;
    const pieceId = appareil.piece;

    // 3. Remove device reference from piece's appareils array
    await Piece.findByIdAndUpdate(pieceId, {
      $pull: { appareils: appareil._id }
    });

    // 4. Delete the device from DB
    await Appareil.findByIdAndDelete(id);

    // 5. Create notification
    const notif = await Notification.create({
      titre: 'Appareil supprimé',
      message: `L'appareil "${deviceName}" a été supprimé avec succès.`,
      type: 'INFO',
      categorie: 'SYSTEME',
      priorite: 'LOW',
      utilisateur: userId
    });

    // 6. Socket.IO push
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${userId}`).emit('new_notification', {
        _id: notif._id,
        titre: notif.titre,
        message: notif.message,
        type: notif.type,
        categorie: notif.categorie,
        priorite: notif.priorite,
        lu: false,
        createdAt: notif.createdAt
      });
      io.to(`user:${userId}`).emit('notifications_changed', { action: 'new' });
    }

    return res.status(200).json({
      success: true,
      message: `Appareil "${deviceName}" supprimé avec succès.`,
      data: { id }
    });

  } catch (error) {
    console.error("Erreur dans fonction [deleteAppareil]:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de la suppression de l'appareil.",
      error: error.message
    });
  }
};
