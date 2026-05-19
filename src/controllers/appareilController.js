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

// Importation du modèle Piece pour l'association et la mise à jour de la chambre
const Piece = require('../models/Piece'); 

// 🔌 INTEGRATION MQTT : Importation de la fonction pour envoyer des messages à Wokwi
const { publishMessage } = require('../config/mqttService');

/**
 * ---------------------------------------------------------------------------------
 * CONTROLLER : CRÉATION ET AJOUT D'UN NOUVEL APPAREIL DOMOTIQUE
 * ---------------------------------------------------------------------------------
 */
exports.createAppareil = async (req, res) => {
  try {
    // Récupération des données envoyées par le client (React) depuis le corps de la requête
    const { nomAppareil, typeAppareil, piece, marque } = req.body;

    // 1. Validation : Vérification que tous les champs obligatoires sont bien fournis
    if (!nomAppareil || !typeAppareil || !piece) {
      return res.status(400).json({
        success: false,
        message: "Veuillez fournir le nom, le type de l'appareil et la pièce associée."
      });
    }

    // 2. Initialisation des données de base communes à tous les appareils
    let appareilData = {
      nomAppareil,
      typeAppareil,
      piece,
      marque: marque || "",
      status: "HORSLIGNE" // Initialisé hors ligne selon les contraintes du schéma Mongoose
    };

    // 3. Injection des valeurs par défaut spécifiques à chaque type (Mécanisme de Discrimination Mongoose)
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
    } else if (typeAppareil === 'ASPIRATEUR') {
      appareilData.chargeBatterie = 100;
      appareilData.estEnCharge = false;
      appareilData.modeNettoyage = 'STANDARD';
    } else if (typeAppareil === 'CAMERA') {
      appareilData.niveauSensibilite = 'MEDIUM';
      appareilData.estDeclanche = false;
      appareilData.resolution = '1080p';
    }

    // 4. Création d'une nouvelle instance du modèle Appareil avec les données préparées
    const nouvelAppareil = new Appareil(appareilData);
    
    // Sauvegarde définitive de l'appareil dans la collection 'appareils' de MongoDB
    await nouvelAppareil.save();

    // 5. Synchronisation : Ajout immédiat de l'ID de cet appareil dans le tableau de la pièce (Piece)
    await Piece.findByIdAndUpdate(piece, {
        $push: { appareils: nouvelAppareil._id }
    });

    // 6. Réponse de succès envoyée au frontend avec l'objet complet nouvellement créé
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
 * CONTROLLER : MISE À JOUR DES PROPRIÉTÉS D'UN APPAREIL CONNECTÉ EXISTANT
 * ---------------------------------------------------------------------------------
 */
exports.updateAppareil = async (req, res) => {
  try {
    const { id } = req.params; // Récupération de l'ID passé dans l'URL
    
    // ⚠️ CRUCIAL : Clonage profond du body et suppression de la clé discriminator pour éviter le blocage Mongoose
    const updateData = { ...req.body };
    delete updateData.typeAppareil;

    // 1. Recherche préalable pour sécuriser et obtenir le type avant modification
    const appareilExiste = await Appareil.findById(id);
    if (!appareilExiste) {
      return res.status(404).json({ 
        success: false, 
        message: "L'appareil demandé est introuvable." 
      });
    }

    // Extraction sécurisée du type d'appareil depuis la base de données
    const typeReel = appareilExiste.typeAppareil?.toUpperCase();

    // 2. CORRECTION CRUCIAL DISCRIMINATOR : Choix du modèle dynamique pour le save Mongoose
    let appareilModifie;
    if (typeReel === 'ASPIRATEUR') {
      // Si c'est un aspirateur, on force l'utilisation du sous-modèle Aspirateur pour ne pas perdre les champs spécifiques
      appareilModifie = await Aspirateur.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: false }
      );
    } else {
      // Pour les autres appareils, on garde le modèle générique
      appareilModifie = await Appareil.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: false }
      );
    }

    if (!appareilModifie) {
      return res.status(400).json({
        success: false,
        message: "Échec de la mise à jour de l'appareil dans la base de données."
      });
    }

    // 3. Configuration du Topic MQTT pour cet appareil spécifiquement
    const deviceTopic = `smart/home/appareil/${id}`;
    
    // --- INTEGRATION MQTT POUR L'ECLAIRAGE ---
    if (typeReel === 'ECLAIRAGE') {
      const statusPayload = appareilModifie.status === 'ENLIGNE' ? 'ON' : 'OFF';
      const intensityPayload = appareilModifie.intensite !== undefined ? appareilModifie.intensite : 100;
      
      const finalPayload = `${statusPayload}:${intensityPayload}`;
      console.log(`📡 [MQTT SUCCESS - ECLAIRAGE] Topic: ${deviceTopic} | Payload: ${finalPayload}`);
      publishMessage(deviceTopic, finalPayload);
    }

    // --- INTEGRATION MQTT POUR LA CAMERA ---
    if (typeReel === 'CAMERA') {
      const currentStatus = updateData.status || appareilModifie.status;
      const statusPayload = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      
      const isRecordingActive = 
        updateData.estEnregistrement === true || 
        appareilModifie.estEnregistrement === true ||
        updateData.isRecording === true ||
        appareilModifie.isRecording === true;

      const recPayload = isRecordingActive ? 'REC' : 'NO_REC';
      const cameraPayload = `${statusPayload}:${recPayload}`;
      
      console.log(`📡 [MQTT SUCCESS - CAMERA] Topic: ${deviceTopic} | Payload: ${cameraPayload}`);
      publishMessage(deviceTopic, cameraPayload);
    }

    // --- INTEGRATION MQTT POUR L'ASPIRATEUR ---
    if (typeReel === 'ASPIRATEUR') {
      const currentStatus = updateData.status || appareilModifie.status;
      const statusPayload = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      
      // Récupération sécurisée du mode depuis l'objet final modifié
      const currentMode = appareilModifie.modeNettoyage || 'STANDARD';
      const modePayload = currentMode.toUpperCase();
      
      const vacuumPayload = `${statusPayload}:${modePayload}`;
      console.log(`📡 [MQTT SUCCESS - ASPIRATEUR] Topic: ${deviceTopic} | Payload: ${vacuumPayload}`);
      
      publishMessage(deviceTopic, vacuumPayload);
    }

    // --- 🌟 INTEGRATION MQTT POUR LE CLIMATISEUR (THERMIQUE) ---
    if (typeReel === 'THERMIQUE') {
      const currentStatus = updateData.status || appareilModifie.status;
      const statusPayload = currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      
      const currentMode = appareilModifie.mode || 'AUTO';
      const modePayload = currentMode.toUpperCase(); // AUTO, FROID, CHAUD, MANUEL
      
      const currentCible = appareilModifie.temperatureCible || 24;

      // Payload envoyé sous format -> STATUS:MODE:TEMPERATURE (Ex: ON:FROID:18)
      const climaPayload = `${statusPayload}:${modePayload}:${currentCible}`;
      console.log(`📡 [MQTT SUCCESS - THERMIQUE] Topic: ${deviceTopic} | Payload: ${climaPayload}`);
      
      publishMessage(deviceTopic, climaPayload);
    }

    // Réponse de succès avec l'appareil synchronisé et persisté en base de données
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