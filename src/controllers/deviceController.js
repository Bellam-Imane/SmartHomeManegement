const Device = require('../models/Device'); 

// 1. Initialiser les appareils (Executé une seule fois ou via un bouton)
exports.initializeDevices = async (req, res) => {
    const defaultDevices = [
        { name: 'clima', status: true, value: 24 },
        { name: 'light', status: true, value: 36 },
        { name: 'lock', status: true, value: 0 },
        { name: 'vacuum', status: true, value: 0 }
    ];
    try {
        const count = await Device.countDocuments();
        if (count === 0) {
            await Device.insertMany(defaultDevices);
            return res.status(201).json({ message: "Appareils initialisés avec succès" });
        }
        res.status(200).json({ message: "Les appareils existent déjà" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Récupérer tous les appareils
exports.getDevices = async (req, res) => {
    try {
        const devices = await Device.find();
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Mettre à jour un appareil (Toggle ON/OFF ou changer Valeur)
exports.updateDevice = async (req, res) => {
    const { name } = req.params;
    const { status, value } = req.body;
    try {
        const updatedDevice = await Device.findOneAndUpdate(
            { name },
            { $set: { status, value, lastUpdated: Date.now() } },
            { new: true }
        );
        res.status(200).json(updatedDevice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};