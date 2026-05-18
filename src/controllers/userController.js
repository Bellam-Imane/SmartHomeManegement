/**
 * userController.js
 * Gestion du profil utilisateur basé sur le modèle User.js
 */
const User = require('../models/User'); 

// @desc    Récupérer les infos du profil
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        // req.user.id جاية من verifyToken middleware
        const user = await User.findById(req.user.id).populate('role');

        if (user) {
            res.status(200).json({
                _id: user._id,
                email: user.email,
                nom: user.profile.nom,
                prenom: user.profile.prenom,
                photo: user.profile.photo,
                telephone: user.profile.telephone,
                role: user.role
            });
        } else {
            res.status(404).json({ message: "Utilisateur non trouvé" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur Serveur", error: error.message });
    }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            // تحديث البيانات وسط كائن profile
            if (req.body.nom) user.profile.nom = req.body.nom;
            if (req.body.prenom) user.profile.prenom = req.body.prenom;
            if (req.body.telephone) user.profile.telephone = req.body.telephone;
            if (req.body.photo) user.profile.photo = req.body.photo;

            if (req.body.email) {
                user.email = req.body.email;
            }

            const updatedUser = await user.save();
            
            res.status(200).json({
                message: "Profil mis à jour avec succès !",
                user: {
                    nom: updatedUser.profile.nom,
                    prenom: updatedUser.profile.prenom,
                    email: updatedUser.email,
                    photo: updatedUser.profile.photo
                }
            });
        } else {
            res.status(404).json({ message: "Utilisateur non trouvé" });
        }
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour", error: error.message });
    }
};