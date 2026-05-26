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

/**
 * ---------------------------------------------------------------------------------
 * CONTROLLER : CRÉATION ET AJOUT D'UN NOUVEL APPAREIL DOMOTIQUE
 * ---------------------------------------------------------------------------------
 */
exports.createAppareil = async (req, res) => {
  try {
    const { nomAppareil, typeAppareil, piece, marque } = req.body;

    // Vérification des champs obligatoires
    if (!nomAppareil || !typeAppareil || !piece) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir le nom, le type de l'appareil et la pièce associée."
      });
    }

    // Préparation des données de base de l'appareil
    let appareilData = {
      nomAppareil,
      typeAppareil,
      piece,
      marque: marque || "",
      status: "HORSLIGNE"
    };

    // Initialisation des propriétés spécifiques selon le type d'appareil
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
      appareilData.chaineActuelle = 1;
      appareilData.lectureActive = true; // Initialisation de l'état de lecture à true (PLAY)
      appareilData.dernierAllumage = null;
      appareilData.tempsUtilisationTotal = 0; // Initialisation du temps d'utilisation à 0
    } else if (typeAppareil === 'MOTORISE') {
      appareilData.pourcentageOuverture = 0;
      appareilData.estVerrouille = true;
      appareilData.mode = 'Ombrage automatique';
    } else if (typeAppareil === 'ASPIRATEUR') {
      appareilData.chargeBatterie = 100;
      appareilData.estEnCharge = false;
      appareilData.modeNettoyage = 'STANDARD';
    } else if (typeAppareil === 'CAMERA') {
      appareilData.niveauSensibilite = 'MEDIUM';
      appareilData.estDeclanche = false;
      appareilData.resolution = '1080p';
    }

    // Instanciation du bon sous-modèle Mongoose selon le discriminateur
    let nouvelAppareil;
    switch (typeAppareil?.toUpperCase()) {
      case 'ECLAIRAGE':   nouvelAppareil = new AppareilEclairage(appareilData);  break;
      case 'THERMIQUE':   nouvelAppareil = new AppareilThermique(appareilData);  break;
      case 'MULTIMEDIA':  nouvelAppareil = new AppareilMultimedia(appareilData); break;
      case 'MOTORISE':    nouvelAppareil = new AppareilMotorise(appareilData);   break;
      case 'ASPIRATEUR':  nouvelAppareil = new Aspirateur(appareilData);         break;
      case 'CAMERA':      nouvelAppareil = new Camera(appareilData);             break;
      default:            nouvelAppareil = new Appareil(appareilData);
    }

    // Sauvegarde de l'appareil dans la base de données
    await nouvelAppareil.save();

    // Liaison automatique de l'appareil créé au tableau de la pièce correspondante
    try {
      await Piece.findByIdAndUpdate(piece, {
          $push: { appareils: nouvelAppareil._id }
      });
      console.log(`✅ Appareil lié à la pièce ${piece} avec succès.`);
    } catch (pieceError) {
      console.error("⚠️ Impossible de lier l'appareil au tableau de la pièce:", pieceError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Appareil ajouté avec succès !",
      data: nouvelAppareil
    });

  } catch (error) {
    console.error("❌ Erreur critique dans fonction [createAppareil]:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'ajout de l'appareil.",
      error: error.message
    });
  }
};

/**
 * ---------------------------------------------------------------------------------
 * CONTROLLER : MISE À JOUR DES PROPRIÉTÉS D'UN APPAREIL CONNECTÉ EXISTANT
 * ---------------------------------------------------------------------------------
 */
exports.updateAppareil = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Clonage du corps de la requête et suppression des clés immuables pour Mongoose
    const updateData = { ...req.body };
    delete updateData.typeAppareil;
    delete updateData._id;  
    delete updateData.id;   

    // Vérification de l'existence de l'appareil avant modification
    const appareilExiste = await Appareil.findById(id);
    if (!appareilExiste) {
      return res.status(404).json({ 
        success: false, 
        message: "L'appareil demandé est introuvable." 
      });
    }

    const typeReel = appareilExiste.typeAppareil?.toUpperCase();
    console.log(`🔍 [DEBUG] ID: ${id} | typeReel: "${typeReel}" | updateData:`, JSON.stringify(updateData));

    // ⏱️ LOGIQUE CHRONOMÈTRE : Calcul du temps de visionnage pour les appareils MULTIMEDIA
    if (typeReel === 'MULTIMEDIA') {
      const maintenant = new Date();
      const nouveauStatus = updateData.status || appareilExiste.status;

      // Cas 1 : L'appareil s'allume (ENLIGNE) ou change d'application -> On enregistre l'heure de début
      if (nouveauStatus === 'ENLIGNE' && (appareilExiste.status === 'HORSLIGNE' || updateData.application !== undefined)) {
        updateData.dernierAllumage = maintenant;
      }
      // Cas 2 : L'appareil s'éteint (HORSLIGNE) -> On calcule la durée et on l'ajoute au total cumulé
      else if (nouveauStatus === 'HORSLIGNE' && appareilExiste.status === 'ENLIGNE' && appareilExiste.dernierAllumage) {
        const tempsPasseMs = maintenant - new Date(appareilExiste.dernierAllumage);
        const tempsPasseMinutes = Math.round(tempsPasseMs / 1000 / 60); // Conversion des millisecondes en minutes
        
        // Cumul du temps passé et réinitialisation du marqueur de début
        updateData.tempsUtilisationTotal = (appareilExiste.tempsUtilisationTotal || 0) + tempsPasseMinutes;
        updateData.dernierAllumage = null;
      }
    }

    // Sélection dynamique du sous-modèle pour appliquer la mise à jour en BDD
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
        message: "Échec de la mise à jour de l'appareil dans la base de données."
      });
    }

    // Définition du canal MQTT unique basé sur l'ID de l'appareil
    const deviceTopic = `smart/home/appareil/${id}`;
    
    // --- MQTT : ECLAIRAGE (Format -> STATUS:INTENSITE) ---
    if (typeReel === 'ECLAIRAGE') {
      const statusPayload    = appareilModifie.status === 'ENLIGNE' ? 'ON' : 'OFF';
      const intensityPayload = appareilModifie.intensite !== undefined ? appareilModifie.intensite : 100;
      const finalPayload     = `${statusPayload}:${intensityPayload}`;

      console.log(`📡 [MQTT - ECLAIRAGE] Topic: ${deviceTopic} | Payload: ${finalPayload}`);
      publishMessage(deviceTopic, finalPayload);
    }

    // --- MQTT : CAMERA (Format -> STATUS:ENREGISTREMENT) ---
    else if (typeReel === 'CAMERA') {
      const currentStatus = updateData.status || appareilModifie.status;
      const statusPayload = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      
      const isRecordingActive = 
        updateData.estEnregistrement === true || 
        appareilModifie.estEnregistrement === true;

      const recPayload    = isRecordingActive ? 'REC' : 'NO_REC';
      const cameraPayload = `${statusPayload}:${recPayload}`;
      
      console.log(`📡 [MQTT - CAMERA] Topic: ${deviceTopic} | Payload: ${cameraPayload}`);
      publishMessage(deviceTopic, cameraPayload);
    }

    // --- MQTT : ASPIRATEUR (Format -> STATUS:MODE) ---
    else if (typeReel === 'ASPIRATEUR') {
      const currentStatus  = updateData.status || appareilModifie.status;
      const statusPayload  = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const currentMode    = appareilModifie.modeNettoyage || 'STANDARD';
      const modePayload    = currentMode.toUpperCase();
      const vacuumPayload  = `${statusPayload}:${modePayload}`;

      console.log(`📡 [MQTT - ASPIRATEUR] Topic: ${deviceTopic} | Payload: ${vacuumPayload}`);
      publishMessage(deviceTopic, vacuumPayload);
    }

    // --- MQTT : CLIMATISEUR THERMIQUE (Format -> STATUS:MODE:TEMPERATURE) ---
    else if (typeReel === 'THERMIQUE') {
      const currentStatus  = updateData.status || appareilModifie.status;
      const statusPayload  = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const currentMode    = appareilModifie.mode || 'AUTO';
      const modePayload    = currentMode.toUpperCase();
      const currentCible   = appareilModifie.temperatureCible || 24;
      const climaPayload   = `${statusPayload}:${modePayload}:${currentCible}`;

      console.log(`📡 [MQTT - THERMIQUE] Topic: ${deviceTopic} | Payload: ${climaPayload}`);
      publishMessage(deviceTopic, climaPayload);
    }

    // --- MQTT : RIDEAUX MOTORISÉS (Format -> STATUS:MODE:POURCENTAGE) ---
    else if (typeReel === 'MOTORISE') {
      const currentStatus   = updateData.status || appareilModifie.status;
      const statusPayload   = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const currentMode     = appareilModifie.mode || 'Ombrage automatique';
      const modePayload     = currentMode.toUpperCase();
      const pourcentage     = appareilModifie.pourcentageOuverture ?? 0;
      const rideauxPayload  = `${statusPayload}:${modePayload}:${pourcentage}`;

      console.log(`📡 [MQTT - MOTORISE] Topic: ${deviceTopic} | Payload: ${rideauxPayload}`);
      publishMessage(deviceTopic, rideauxPayload);
    }

    // --- MQTT : MULTIMEDIA (Format -> STATUS:APPLICATION:VOLUME:CHAINE:LECTURE) ---
    else if (typeReel === 'MULTIMEDIA') {
      const currentStatus   = updateData.status || appareilModifie.status;
      const statusPayload   = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const currentApp      = updateData.application || appareilModifie.application || 'NONE';
      const appPayload      = currentApp.toUpperCase();
      const currentVolume   = appareilModifie.estMuet ? 0 : (appareilModifie.volume ?? 20);
      const currentChannel  = appareilModifie.chaineActuelle || 1;
      
      // Nouvelle variable pour gérer l'état de Lecture / Pause (PLAY ou PAUSE)
      const isPlaying       = (appareilModifie.lectureActive !== false);
      const currentLecture  = isPlaying ? "PLAY" : "PAUSE";
      
      // Construction du Payload final incluant le nouvel argument de lecture
      const multimediaPayload = `${statusPayload}:${appPayload}:${currentVolume}:${currentChannel}:${currentLecture}`;
      
      // 📺 LOG DÉTAILLÉ DANS LE TERMINAL POUR LE MULTIMÉDIA (AVEC ÉTAT DU VIDÉO)
      console.log(`\n==================================================`);
      console.log(`📡 [MQTT - MULTIMEDIA] Topic: ${deviceTopic}`);
      console.log(`🎬 [ÉTAT VIDÉO]      : ${isPlaying ? 'PLAY ▶️ (En cours de lecture)' : 'PAUSE ⏸️ (Arrêté)'}`);
      console.log(`📦 [PAYLOAD ENVOYÉ]  : ${multimediaPayload}`);
      console.log(`==================================================\n`);

      publishMessage(deviceTopic, multimediaPayload);
    }

    return res.status(200).json({
      success: true,
      message: "Appareil mis à jour avec succès !",
      data: appareilModifie
    });

  } catch (error) {
    console.error("❌ Erreur interne dans fonction [updateAppareil]:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur interne du serveur est survenue.",
      error: error.message
    });
  }
};

/**
 * ---------------------------------------------------------------------------------
 * CONTROLLER : RÉCUPÉRER TOUS LES APPAREILS
 * ---------------------------------------------------------------------------------
 */
exports.getAllAppareils = async (req, res) => {
  try {
    const appareils = await Appareil.find().populate('piece');

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