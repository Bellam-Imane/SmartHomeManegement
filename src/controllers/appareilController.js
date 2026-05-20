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
      appareilData.chaineActuelle = 1;
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

    // Sauvegarde de l'appareil
    await nouvelAppareil.save();

    // SÉCURITÉ MAXIMUM : Liaison de l'appareil créé au tableau de la pièce correspondante
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
    
    // Clonage du body et suppression des IDs pour empêcher le blocage d'immuabilité Mongoose
    const updateData = { ...req.body };
    delete updateData.typeAppareil;
    delete updateData._id;  
    delete updateData.id;   

    const appareilExiste = await Appareil.findById(id);
    if (!appareilExiste) {
      return res.status(404).json({ 
        success: false, 
        message: "L'appareil demandé est introuvable." 
      });
    }

    const typeReel = appareilExiste.typeAppareil?.toUpperCase();

    console.log(`🔍 [DEBUG] ID: ${id} | typeReel: "${typeReel}" | updateData:`, JSON.stringify(updateData));

    // Sélection dynamique du modèle pour la mise à jour en BDD (évite la perte d'attributs spécifiques)
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

    // --- MQTT : RIDEAUX MOTORISÉS DE MANIÈRE INDIVIDUELLE (Format -> STATUS:MODE:POURCENTAGE) ---
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

    // --- MQTT : MULTIMEDIA (🌟 VERSION CORRIGÉE POUR L'AUTOMATISATION DES RIDEAUX) ---
    else if (typeReel === 'MULTIMEDIA') {
      const currentStatus   = updateData.status || appareilModifie.status;
      const statusPayload   = currentStatus === 'ENLINLE' || currentStatus === 'ENLIGNE' ? 'ON' : 'OFF';
      const currentApp      = updateData.application || appareilModifie.application || 'NONE';
      const appPayload      = currentApp.toUpperCase();
      const currentVolume   = appareilModifie.estMuet ? 0 : (appareilModifie.volume ?? 20);
      const currentChannel  = appareilModifie.chaineActuelle || 1;
      
      const multimediaPayload = `${statusPayload}:${appPayload}:${currentVolume}:${currentChannel}`;
      console.log(`📡 [MQTT - MULTIMEDIA] Topic: ${deviceTopic} | Payload: ${multimediaPayload}`);
      publishMessage(deviceTopic, multimediaPayload);

      // 🌟 SCÉNARIO AUTOMATIQUE : Si le bouton Mode Cinéma de la TV est cliqué (true ou false)
      if (updateData.modeCinema !== undefined) {
        const etatCinema = updateData.modeCinema; // Contient true ou false
        const idPiece = appareilModifie.piece;   // Récupération de l'ID de la pièce actuelle de la TV

        if (idPiece) {
          // 🔍 REQUÊTE SÉCURISÉE : On cherche dans le modèle global 'Appareil' pour éviter les conflits de discriminators
          const rideauxDeLaPiece = await Appareil.find({ 
            piece: idPiece, 
            typeAppareil: 'MOTORISE' 
          });

          // Calcul du pourcentage : Si Cinéma activé -> Fermé (100%), sinon OFF -> Ouvert (0%)
          const ciblePourcentage = etatCinema ? 100 : 0;

          console.log(`🎬 [SCÉNARIO CINÉMA] Nombre de rideaux trouvés dans la pièce [${idPiece}]: ${rideauxDeLaPiece.length}`);

          // Traitement de chaque rideau trouvé dans la pièce
          for (let rideau of rideauxDeLaPiece) {
            let structureMiseAJour = { pourcentageOuverture: ciblePourcentage };

            // OBLIGATION LOGIQUE : Si le rideau est hors ligne ou OFF, on force son passage à ENLIGNE d'abord
            if (rideau.status === 'HORSLIGNE' || rideau.status === 'OFF') {
              structureMiseAJour.status = 'ENLIGNE';
            }

            // Mise à jour de l'état du rideau dans la base de données
            const rideauMisAJour = await Appareil.findByIdAndUpdate(
              rideau._id,
              { $set: structureMiseAJour },
              { returnDocument: 'after', runValidators: false }
            );

            if (rideauMisAJour) {
              // Envoi immédiat du message MQTT standardisé à l'ESP32 qui pilote le rideau physique
              const rideauTopic = `smart/home/appareil/${rideau._id}`;
              const rStatus     = rideauMisAJour.status === 'ENLIGNE' ? 'ON' : 'OFF';
              const rMode       = (rideauMisAJour.mode || 'Ombrage automatique').toUpperCase();
              const rPayload    = `${rStatus}:${rMode}:${rideauMisAJour.pourcentageOuverture}`;

              console.log(`🎬 [SCÉNARIO CINÉMA - SYNCHRO] Rideau [${rideauMisAJour.nomAppareil}] synchronisé | Topic: ${rideauTopic} | Payload: ${rPayload}`);
              publishMessage(rideauTopic, rPayload);
            }
          }
        } else {
          console.log("⚠️ Impossible de lancer le scénario : Aucun ID de pièce trouvé pour cet appareil Multimedia.");
        }
      }
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