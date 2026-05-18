// Importation du modèle racine Appareil en utilisant le destructuring { Appareil }
// Cela résout définitivement l'erreur "Appareil is not a constructor"
const { Appareil } = require('../models/Appareil'); 

// Importation du modèle Piece pour l'association et la mise à jour de la chambre
const Piece = require('../models/Piece'); 

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
 * CONTROLLER : MISE À JOUR DES PROPRIÉTÉS D'UN APPAREIL CONSECTÉ EXISTANT
 * ---------------------------------------------------------------------------------
 */
exports.updateAppareil = async (req, res) => {
  try {
    const { id } = req.params; // Récupération de l'ID passé dans l'URL
    const updateData = req.body; // Récupération des modifications à appliquer

    // Recherche de l'appareil par ID et application des modifications via MongoDB
    const appareilModifie = await Appareil.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // {new: true} renvoie l'objet après modification
    );

    // Vérification de l'existence de l'appareil avant de confirmer
    if (!appareilModifie) {
      return res.status(404).json({ 
        success: false, 
        message: "L'appareil demandé est introuvable." 
      });
    }

    // Réponse de succès avec l'appareil synchronisé
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