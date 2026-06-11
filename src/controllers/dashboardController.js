/**
 * dashboardController.js
 * Provides dashboard data: live sensor readings, device states,
 * energy metrics, and unread notification count.
 */
const { Appareil } = require('../models/Appareil');
const User = require('../models/User');
const { getLatestSensorData, getEnergyAggregated } = require('../services/influxService');
const { getSecurityNotifications } = require('../services/historyService');

/**
 * @desc    Dashboard summary — all data for the main dashboard page
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
exports.getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch user info
        const user = await User.findById(userId).populate('maison');

        // 2. Fetch 4 dashboard devices in parallel
        const [clima, light, lock, aspi] = await Promise.all([
            Appareil.findOne({ typeAppareil: 'THERMIQUE' }),
            Appareil.findOne({ typeAppareil: 'ECLAIRAGE' }),
            Appareil.findOne({ typeAppareil: 'MOTORISE', nomAppareil: /serrure/i })
                .then(r => r || Appareil.findOne({ typeAppareil: 'PORTE' })),
            Appareil.findOne({ typeAppareil: 'ASPIRATEUR' })
        ]);

        // 3. Live sensor data from InfluxDB (internal temperature)
        const temperatureInterieure = await getLatestSensorData('temperature', '-1h');

        // 4. Consumed energy: aggregate consommationActuelle from ALL online devices
        const onlineDevices = await Appareil.find({ status: 'ENLIGNE' }, 'consommationActuelle');
        const energieConsommee = onlineDevices.reduce(
            (sum, d) => sum + (d.consommationActuelle || 0), 0
        );

        // 5. Solar energy: simulated data (no physical sensor)
        //    Base production ~1.8 kWh, varies by hour of day (peak at noon)
        const hour = new Date().getHours();
        const solarFactor = hour >= 6 && hour <= 18
            ? Math.sin(((hour - 6) / 12) * Math.PI)  // bell curve 6am-6pm
            : 0;
        const energieSolaire = Math.round((1.8 * solarFactor) * 100) / 100;

        // 6. Unread notifications count from PostgreSQL
        let unreadCount = 0;
        try {
            const notifs = await getSecurityNotifications({ userId, unreadOnly: true, limit: 100 });
            unreadCount = notifs.length;
        } catch (e) {
            console.warn("[Dashboard] Could not fetch notifications:", e.message);
        }

        // 7. Active devices count
        const totalDevices = await Appareil.countDocuments();
        const activeDevices = await Appareil.countDocuments({ status: 'ENLIGNE' });

        res.status(200).json({
            sensors: {
                temperatureInterieure: temperatureInterieure !== null ? temperatureInterieure : 24,
                energieConsommee: Math.round(energieConsommee * 100) / 100,
                energieSolaire
            },
            devices: {
                climatiseur: clima || { status: 'HORSLIGNE', temperatureActuelle: 24, temperatureCible: 24, mode: 'AUTO' },
                lumiere: light || { status: 'HORSLIGNE', intensite: 36 },
                serrure: lock || { estVerrouillee: true },
                aspirateur: aspi || { status: 'HORSLIGNE', chargeBatterie: 69 }
            },
            stats: {
                totalDevices,
                activeDevices,
                unreadNotifications: unreadCount
            },
            user: {
                nom: user?.nom,
                email: user?.email,
                role: user?.role
            }
        });
    } catch (error) {
        console.error("[Dashboard] getDashboardSummary error:", error.message);
        res.status(500).json({ message: "Erreur Serveur", error: error.message });
    }
};

/**
 * @desc    Energy chart data — aggregated by time window
 * @route   GET /api/dashboard/energy
 * @query   ?range=-7d&window=1d   (range: -24h, -7d, -30d | window: 1h, 1d, 1mo)
 * @access  Private
 */
exports.getEnergyChart = async (req, res) => {
    try {
        const { range = '-7d', window = '1d' } = req.query;

        // Validate range format (must start with -)
        const validRange = range.startsWith('-') ? range : '-7d';
        const validWindow = ['1h', '6h', '1d', '1w', '1mo'].includes(window) ? window : '1d';

        const chartData = await getEnergyAggregated(validRange, validWindow);

        res.status(200).json(chartData);
    } catch (error) {
        console.error("[Dashboard] getEnergyChart error:", error.message);
        res.status(500).json({ message: "Erreur lors de la récupération des données énergétiques", error: error.message });
    }
};
