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

    if (!nomAppareil || !typeAppareil || !piece) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir le nom, le type de l'appareil et la pièce associée."
      });
    }

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
    } else if (typeAppareil === 'MOTORISE') {
      appareilData.pourcentageOuverture = 0;
      appareilData.estVerrouille = true;
      appareilData.mode = 'Ombrage automatique'; // Valeur par défaut pour le rideau
    } else if (typeAppareil === 'ASPIRATEUR') {
      appareilData.chargeBatterie = 100;
      appareilData.estEnCharge = false;
      appareilData.modeNettoyage = 'STANDARD';
    } else if (typeAppareil === 'CAMERA') {
      appareilData.niveauSensibilite = 'MEDIUM';
      appareilData.estDeclanche = false;
      appareilData.resolution = '1080p';
    }

    // Sélection du modèle de discriminateur approprié pour la sauvegarde
    let nouvelAppareil;

    switch (typeAppareil?.toUpperCase()) {
      case 'ECLAIRAGE':
        nouvelAppareil = new AppareilEclairage(appareilData);
        break;
      case 'THERMIQUE':
        nouvelAppareil = new AppareilThermique(appareilData);
        break;
      case 'MULTIMEDIA':
        nouvelAppareil = new AppareilMultimedia(appareilData);
        break;
      case 'MOTORISE':
        nouvelAppareil = new AppareilMotorise(appareilData);
        break;
      case 'ASPIRATEUR':
        nouvelAppareil = new Aspirateur(appareilData);
        break;
      case 'CAMERA':
        nouvelAppareil = new Camera(appareilData);
        break;
      default:
        nouvelAppareil = new Appareil(appareilData);
    }

    // Sauvegarde effective dans la collection MongoDB unique 'appareils'
    await nouvelAppareil.save();

    // Attachement de l'identifiant de l'appareil à la pièce correspondante
    await Piece.findByIdAndUpdate(piece, {
        $push: { appareils: nouvelAppareil._id }
    });

    return res.status(201).json({
      success: true,
      message: "Appareil ajouté avec succès !",
      data: nouvelAppareil
    });

  } catch (error) {
    console.error("Erreur dans fonction [createAppareil]:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur est survenue lors de l'ajout de l'appareil.",
      error: error.message
    });
  }
};

/**
 * ---------------------------------------------------------------------------------
 * CONTROLLER : MISE À ZONE DES PROPRIÉTÉS D'UN APPAREIL CONNECTÉ EXISTANT
 * ---------------------------------------------------------------------------------
 */
exports.updateAppareil = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Clonage du body et suppression du discriminator pour éviter le blocage Mongoose
    const updateData = { ...req.body };
    delete updateData.typeAppareil;

    // Recherche préalable pour récupérer le type réel depuis MongoDB
    const appareilExiste = await Appareil.findById(id);
    if (!appareilExiste) {
      return res.status(404).json({ 
        success: false, 
        message: "L'appareil demandé est introuvable." 
      });
    }

    // Récupération et normalisation du type depuis la base de données
    const typeReel = appareilExiste.typeAppareil?.toUpperCase();

    // Log de debug pour tracer le type reçu et les données envoyées
    console.log(`🔍 [DEBUG] ID: ${id} | typeReel: "${typeReel}" | updateData:`, JSON.stringify(updateData));

    // Choix du modèle dynamique selon le type pour éviter la perte des champs spécifiques
    let appareilModifie;
    if (typeReel === 'ASPIRATEUR') {
      appareilModifie = await Aspirateur.findByIdAndUpdate(
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

    // Construction du topic MQTT propre à cet appareil
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
    if (typeReel === 'CAMERA') {
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
    if (typeReel === 'ASPIRATEUR') {
      const currentStatus  = updateData.status || appareilModifie.status;
      const statusPayload  = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const currentMode    = appareilModifie.modeNettoyage || 'STANDARD';
      const modePayload    = currentMode.toUpperCase();
      const vacuumPayload  = `${statusPayload}:${modePayload}`;

      console.log(`📡 [MQTT - ASPIRATEUR] Topic: ${deviceTopic} | Payload: ${vacuumPayload}`);
      publishMessage(deviceTopic, vacuumPayload);
    }

    // --- MQTT : CLIMATISEUR THERMIQUE (Format -> STATUS:MODE:TEMPERATURE) ---
    if (typeReel === 'THERMIQUE') {
      const currentStatus  = updateData.status || appareilModifie.status;
      const statusPayload  = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const currentMode    = appareilModifie.mode || 'AUTO';
      const modePayload    = currentMode.toUpperCase();
      const currentCible   = appareilModifie.temperatureCible || 24;
      const climaPayload   = `${statusPayload}:${modePayload}:${currentCible}`;

      console.log(`📡 [MQTT - THERMIQUE] Topic: ${deviceTopic} | Payload: ${climaPayload}`);
      publishMessage(deviceTopic, climaPayload);
    }

    // --- 🌟 CORRECTION : MQTT : RIDEAUX MOTORISÉS (Nouveau Format -> STATUS:MODE:POURCENTAGE) ---
    if (typeReel === 'MOTORISE') {
      const currentStatus   = updateData.status || appareilModifie.status;
      const statusPayload   = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      
      // Récupération sécurisée du mode actuel depuis la mise à jour ou l'objet existant
      const currentMode     = appareilModifie.mode || 'Ombrage automatique';
      // Remplacement des espaces par des underscores pour la propreté du payload MQTT si nécessaire
      const modePayload     = currentMode.toUpperCase();
      
      const pourcentage     = appareilModifie.pourcentageOuverture ?? 0;
      
      // Assemblage du nouveau payload incluant le mode
      const rideauxPayload  = `${statusPayload}:${modePayload}:${pourcentage}`;

      console.log(`📡 [MQTT - MOTORISE] Topic: ${deviceTopic} | Payload: ${rideauxPayload}`);
      publishMessage(deviceTopic, rideauxPayload);
    }

    return res.status(200).json({
      success: true,
      message: "Appareil mis à jour avec succès !",
      data: appareilModifie
    });

  } catch (error) {
    console.error("Erreur dans fonction [updateAppareil]:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur interne du serveur est survenue.",
      error: error.message
    });
  }
};