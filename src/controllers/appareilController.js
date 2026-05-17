const Appareil = require('../models/Appareil'); 

// Mise à jour des propriétés d'un appareil domotique
exports.updateAppareil = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body; // Récupération des données envoyées par le frontend

    // Recherche et mise à jour de l'appareil dans MongoDB avec les nouvelles données
    const appareilModifie = await Appareil.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true } // Renvoie l'objet modifié et active la validation du schéma
    );

    // Vérification si l'appareil existe dans la base de données
    if (!appareilModifie) {
      return res.status(404).json({ 
        success: false, 
        message: "L'appareil demandé est introuvable." 
      });
    }

    // Réponse de succès avec l'appareil mis à jour
    return res.status(200).json({
      success: true,
      message: "Appareil mis à jour avec succès !",
      data: appareilModifie
    });

  } catch (error) {
    // Gestion des erreurs en cas de problème avec la base de données
    console.error("Erreur dans updateAppareil:", error);
    return res.status(500).json({
      success: false,
      message: "Une erreur interne du serveur est survenue.",
      error: error.message
    });
  }
};