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
    // Cela évite les erreurs de validation du schéma (500 Internal Server Error)
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
    // Capture et affichage de l'erreur exacte dans le terminal du serveur pour le débogage
    console.error("Erreur dans fonction [createAppareil]:", error);
    
    // Réponse d'erreur renvoyée au client en cas d'échec de la base de données
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
    const updateData = req.body; // Récupération des modifications à appliquer

    // 1. Recherche préalable de l'appareil pour identifier son type réel (Discriminator Key)
    const appareilExiste = await Appareil.findById(id);
    if (!appareilExiste) {
      return res.status(404).json({ 
        success: false, 
        message: "L'appareil demandé est introuvable." 
      });
    }

    // 2. Sélection dynamique du modèle enfant approprié
    // Mongoose nécessite le modèle spécifique (ex: AppareilEclairage) pour ne pas filtrer les champs spécifiques comme 'intensite'
    let ModelCible = Appareil; // Modèle parent par défaut
    const type = appareilExiste.typeAppareil?.toUpperCase();

    if (type === 'ECLAIRAGE') ModelCible = AppareilEclairage;
    else if (type === 'THERMIQUE') ModelCible = AppareilThermique;
    else if (type === 'MULTIMEDIA') ModelCible = AppareilMultimedia;
    else if (type === 'MOTORISE') ModelCible = AppareilMotorise;
    else if (type === 'ASPIRATEUR') ModelCible = Aspirateur;
    else if (type === 'CAMERA') ModelCible = Camera;
    else if (type === 'PORTE') ModelCible = PorteIntelligent;
    else if (type === 'CAPTEUR') ModelCible = Capteur;

    // 3. Application des modifications sur le modèle cible identifié
    // Remplacement de { new: true } par { returnDocument: 'after' } pour supprimer définitivement le Warning de Mongoose
    const appareilModifie = await ModelCible.findByIdAndUpdate(
      id,
      { $set: updateData },
      { returnDocument: 'after', runValidators: true } 
    );

    // 4. 🔌 INTEGRATION MQTT DYNAMIQUE : On envoie l'état à l'appareil réel sur Wokwi
    // Le topic contient l'ID de l'appareil pour éviter les mélanges entre pièces
    const deviceTopic = `smart/home/appareil/${id}`;
    
    // On analyse les modifications de l'éclairage pour envoyer le statut et l'intensité ensemble
    if (appareilModifie.typeAppareil === 'ECLAIRAGE') {
      // Format du message combiné : "STATUS:INTENSITE" (Exemple: "ON:75" ou "OFF:0")
      const statusPayload = appareilModifie.status === 'ENLIGNE' ? 'ON' : 'OFF';
      const intensityPayload = appareilModifie.intensite !== undefined ? appareilModifie.intensite : 100;
      
      const finalPayload = `${statusPayload}:${intensityPayload}`;
      
      // Publication du message combiné vers le broker MQTT
      publishMessage(deviceTopic, finalPayload);
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