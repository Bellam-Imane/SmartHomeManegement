// src/controllers/securityController.js

exports.getAlarmStatus = async (req, res) => {
    res.json({ message: "Status de l'alarme récupéré" });
};

exports.updateAlarmStatus = async (req, res) => {
    res.json({ message: "Alarme mise à jour" });
};

exports.getAllDoors = async (req, res) => {
    res.json({ message: "Liste des portes récupérée" });
};

exports.toggleDoorLock = async (req, res) => {
    res.json({ message: "Verrouillage modifié" });
};

exports.getAllSensors = async (req, res) => {
    res.json({ message: "Capteurs récupérés" });
};

exports.getAllCameras = async (req, res) => {
    res.json({ message: "Caméras récupérées" });
};