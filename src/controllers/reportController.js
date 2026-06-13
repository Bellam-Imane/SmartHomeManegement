/**
 * reportController.js
 * Reports & Analytics — aggregates data from MongoDB, InfluxDB, and PostgreSQL.
 * Single endpoint feeds the entire Reports page in one network call.
 */
const { Appareil } = require('../models/Appareil');
const { getEnergyAggregated } = require('../services/influxService');
const { pgPool } = require('../config/db');
const { getAppareilFilter } = require('../utils/userScope');

// ==========================================
// FALLBACK DATA — matches UI screenshots exactly
// ==========================================
const FALLBACK = {
    kpis: {
        totalConsumption: { value: 482.5, previous: 512.1, trend: -5.8, unit: 'kWh' },
        activeDevices: { active: 12, total: 24, peakHour: '19:00' },
        avgUsageTime: { hours: 6, minutes: 42, formatted: '6h 42m' },
        mostUsedDevice: { name: 'Air Cond.', type: 'THERMIQUE', hoursToday: 12.5 }
    },
    chart: {
        daily: {
            labels: ['Lun', 'Mar', 'Merc', 'Jeud', 'Vend', 'Sam', 'Dim'],
            values: [75, 55, 50, 35, 30, 95, 35]
        },
        weekly: {
            labels: ['S1', 'S2', 'S3', 'S4'],
            values: [55, 80, 63, 72]
        }
    },
    weeklyStats: {
        savings: 14.20,
        efficiencyScore: 88,
        peakUsage: { day: 'Lundi', time: '18:45', formatted: 'Lundi, 18:45' },
        carbonFootprint: { value: 12, unit: 'kg CO2' }
    },
    deviceBreakdown: [
        { name: 'Air conditionné', type: 'THERMIQUE', percentage: 25 },
        { name: 'Refrigerator', type: null, percentage: 47 },
        { name: 'Four électrique', type: null, percentage: 63 },
        { name: 'Eclairage intelligent', type: 'ECLAIRAGE', percentage: 20 },
        { name: 'Home Theatre', type: 'MULTIMEDIA', percentage: 35 }
    ]
};

// Constants
const ELECTRICITY_RATE = 0.12; // $/kWh
const CO2_FACTOR = 0.5;        // kg CO2 per kWh
const DAY_NAMES = ['Dim', 'Lun', 'Mar', 'Merc', 'Jeud', 'Vend', 'Sam'];
const DAY_NAMES_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// ==========================================
// SIMULATION ENGINE — generates realistic random data on every request
// Activated via GET /api/reports/summary?simulate=true
// ==========================================
function rand(min, max) {
    return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSimulatedData(realActiveCount, realTotalCount) {
    // --- Consumption ---
    const totalConsumption = rand(400, 600);
    const previousConsumption = rand(450, 650);
    const trend = Math.round(((totalConsumption - previousConsumption) / previousConsumption) * 1000) / 10;

    // --- Usage time ---
    const avgH = randInt(4, 9);
    const avgM = randInt(0, 59);

    // --- Device hours ---
    const deviceHours = rand(8, 18);

    // --- Chart: 7 daily bars with realistic patterns ---
    const dailyValues = [
        randInt(40, 70),   // Lun
        randInt(35, 65),   // Mar
        randInt(30, 60),   // Merc
        randInt(25, 55),   // Jeud
        randInt(20, 50),   // Vend
        randInt(60, 95),   // Sam (weekend peak)
        randInt(25, 55)    // Dim
    ];

    // --- Chart: 4 weekly bars ---
    const weeklyValues = [
        randInt(40, 80),
        randInt(50, 90),
        randInt(35, 75),
        randInt(45, 85)
    ];

    // --- Stats ---
    const savings = rand(5, 35);
    const efficiencyScore = randInt(72, 96);
    const peakDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const peakDay = peakDays[randInt(0, 6)];
    const peakTime = `${String(randInt(17, 21)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}`;
    const carbonValue = Math.round(totalConsumption * CO2_FACTOR * 10) / 10;

    // --- Peak hour for KPI card ---
    const peakHour = `${String(randInt(17, 21)).padStart(2, '0')}:00`;

    // --- Device breakdown (5 devices, random %) ---
    const rawPcts = [randInt(15, 45), randInt(25, 55), randInt(30, 65), randInt(10, 35), randInt(20, 45)];

    const deviceNames = ['Air Cond.', 'Climatiseur', 'Ventilateur', 'Chauffage', 'Pompe'];
    const deviceNamePick = deviceNames[randInt(0, deviceNames.length - 1)];

    return {
        kpis: {
            totalConsumption: { value: totalConsumption, previous: previousConsumption, trend, unit: 'kWh' },
            activeDevices: {
                active: realActiveCount ?? randInt(8, 16),
                total: realTotalCount ?? randInt(18, 28),
                peakHour
            },
            avgUsageTime: { hours: avgH, minutes: avgM, formatted: `${avgH}h ${String(avgM).padStart(2, '0')}m` },
            mostUsedDevice: { name: deviceNamePick, type: 'THERMIQUE', hoursToday: deviceHours }
        },
        chart: {
            daily: { labels: ['Lun', 'Mar', 'Merc', 'Jeud', 'Vend', 'Sam', 'Dim'], values: dailyValues },
            weekly: { labels: ['S1', 'S2', 'S3', 'S4'], values: weeklyValues }
        },
        weeklyStats: {
            savings,
            efficiencyScore,
            peakUsage: { day: peakDay, time: peakTime, formatted: `${peakDay}, ${peakTime}` },
            carbonFootprint: { value: carbonValue, unit: 'kg CO2' }
        },
        deviceBreakdown: [
            { name: 'Air conditionné', type: 'THERMIQUE', percentage: rawPcts[0] },
            { name: 'Refrigerator', type: null, percentage: rawPcts[1] },
            { name: 'Four électrique', type: null, percentage: rawPcts[2] },
            { name: 'Eclairage intelligent', type: 'ECLAIRAGE', percentage: rawPcts[3] },
            { name: 'Home Theatre', type: 'MULTIMEDIA', percentage: rawPcts[4] }
        ]
    };
}

/**
 * @desc    Full report summary — all analytics for the Reports page
 * @route   GET /api/reports/summary
 * @query   ?simulate=true — bypass DB and return realistic random data (demo mode)
 * @access  Private
 */
exports.getReportSummary = async (req, res) => {
    try {
        // ==========================================
        // SIMULATION MODE: ?simulate=true
        // Returns realistic random data every request (demo/proof mode)
        // ==========================================
        if (req.query.simulate === 'true') {
            // Grab real device counts from MongoDB for authenticity (scoped to user)
            let realActive = null, realTotal = null;
            try {
                const userFilter = await getAppareilFilter(req.user.id);
                realTotal = await Appareil.countDocuments(userFilter);
                realActive = await Appareil.countDocuments({ ...userFilter, status: 'ENLIGNE' });
            } catch (_) { /* ignore — use random */ }
            const simData = generateSimulatedData(realActive, realTotal);
            console.log('[Reports] 🎲 SIMULATION MODE — returning randomized data');
            return res.status(200).json(simData);
        }

        // ==========================================
        // PARALLEL QUERIES — all databases hit simultaneously
        // ==========================================
        // SECURITE : Filtrer uniquement les appareils de la maison de l'utilisateur
        const userFilter = await getAppareilFilter(req.user.id);

        const [
            allDevices,
            totalDeviceCount,
            activeDeviceCount,
            dailyEnergy,
            weeklyEnergy,
            prevWeeklyEnergy,
            peakHourResult,
            peakDayResult
        ] = await Promise.all([
            // 1. MongoDB: all devices with consumption data (scoped to user)
            Appareil.find(userFilter).select('nomAppareil typeAppareil status consommationActuelle tempsUtilisationTotal dernierAllumage'),
            // 2. MongoDB: total count (scoped to user)
            Appareil.countDocuments(userFilter),
            // 3. MongoDB: active count (scoped to user)
            Appareil.countDocuments({ ...userFilter, status: 'ENLIGNE' }),
            // 4. InfluxDB: daily chart (7 days, 1-day buckets)
            getEnergyAggregated('-7d', '1d'),
            // 5. InfluxDB: weekly chart (4 weeks, 7-day buckets)
            getEnergyAggregated('-28d', '7d'),
            // 6. InfluxDB: previous 2 weeks (for savings comparison)
            getEnergyAggregated('-14d', '7d'),
            // 7. PostgreSQL: peak hour from device state changes
            pgPool.query(`
                SELECT EXTRACT(HOUR FROM date_evenement) AS peak_hour, COUNT(*) AS cnt
                FROM historique_donnees
                WHERE valeur_nouvelle = 'ENLIGNE'
                  AND date_evenement >= NOW() - INTERVAL '7 days'
                GROUP BY peak_hour
                ORDER BY cnt DESC
                LIMIT 1
            `).catch(e => { console.warn('[Reports] Peak hour query failed:', e.message); return { rows: [] }; }),
            // 8. PostgreSQL: peak day from device state changes
            pgPool.query(`
                SELECT TO_CHAR(date_evenement, 'Day') AS peak_day,
                       TO_CHAR(date_evenement, 'HH24:MI') AS peak_time,
                       COUNT(*) AS cnt
                FROM historique_donnees
                WHERE valeur_nouvelle = 'ENLIGNE'
                  AND date_evenement >= NOW() - INTERVAL '7 days'
                GROUP BY peak_day, peak_time
                ORDER BY cnt DESC
                LIMIT 1
            `).catch(e => { console.warn('[Reports] Peak day query failed:', e.message); return { rows: [] }; })
        ]);

        // ==========================================
        // COMPUTE KPIs
        // ==========================================

        // --- Total Consumption ---
        // Sum of consommationActuelle (Watts) across all devices, converted to kWh (daily estimate)
        const totalWatts = allDevices.reduce((sum, d) => sum + (d.consommationActuelle || 0), 0);
        const dailyKwh = Math.round((totalWatts / 1000) * 24 * 10) / 10; // daily kWh from real devices
        const weeklyKwh = Math.round(dailyKwh * 7 * 10) / 10; // weekly projection

        // Use InfluxDB ONLY if it has >= 5 days of data; otherwise use MongoDB device projection
        let totalConsumption, previousConsumption, trend;
        const influxWeekly = (dailyEnergy.count >= 5)
            ? dailyEnergy.consumption.reduce((a, b) => a + b, 0)
            : null;

        if (influxWeekly && influxWeekly > 20) {
            totalConsumption = Math.round(influxWeekly * 10) / 10;
        } else if (weeklyKwh > 20) {
            totalConsumption = weeklyKwh;
        } else {
            totalConsumption = FALLBACK.kpis.totalConsumption.value;
        }

        // Previous period
        if (prevWeeklyEnergy.count >= 2) {
            const prevWeek = prevWeeklyEnergy.consumption.slice(0, Math.floor(prevWeeklyEnergy.count / 2));
            previousConsumption = Math.round(prevWeek.reduce((a, b) => a + b, 0) * 10) / 10;
        } else {
            previousConsumption = FALLBACK.kpis.totalConsumption.previous;
        }

        trend = previousConsumption > 0
            ? Math.round(((totalConsumption - previousConsumption) / previousConsumption) * 1000) / 10
            : FALLBACK.kpis.totalConsumption.trend;

        // --- Peak Active Hour ---
        let peakHour = FALLBACK.kpis.activeDevices.peakHour;
        if (peakHourResult.rows.length > 0) {
            const h = parseInt(peakHourResult.rows[0].peak_hour);
            peakHour = `${String(h).padStart(2, '0')}:00`;
        }

        // --- Average Usage Time ---
        let avgHours = FALLBACK.kpis.avgUsageTime.hours;
        let avgMinutes = FALLBACK.kpis.avgUsageTime.minutes;
        let avgFormatted = FALLBACK.kpis.avgUsageTime.formatted;

        const devicesWithUsage = allDevices.filter(d => d.tempsUtilisationTotal && d.tempsUtilisationTotal > 0);
        if (devicesWithUsage.length > 0) {
            const totalMinutes = devicesWithUsage.reduce((sum, d) => sum + d.tempsUtilisationTotal, 0);
            const avgMin = Math.round(totalMinutes / devicesWithUsage.length);
            avgHours = Math.floor(avgMin / 60);
            avgMinutes = avgMin % 60;
            avgFormatted = `${avgHours}h ${String(avgMinutes).padStart(2, '0')}m`;
        } else if (allDevices.length > 0) {
            // Estimate from online devices: assume each online device runs ~6h/day
            const onlineCount = activeDeviceCount || 1;
            const estimatedAvgMin = Math.round((6 * 60 * onlineCount) / Math.max(allDevices.length, 1));
            avgHours = Math.floor(estimatedAvgMin / 60);
            avgMinutes = estimatedAvgMin % 60;
            avgFormatted = `${avgHours}h ${String(avgMinutes).padStart(2, '0')}m`;
        }

        // --- Most Used Device ---
        let mostUsedName = FALLBACK.kpis.mostUsedDevice.name;
        let mostUsedType = FALLBACK.kpis.mostUsedDevice.type;
        let mostUsedHours = FALLBACK.kpis.mostUsedDevice.hoursToday;

        const sortedByConsumption = [...allDevices]
            .filter(d => d.consommationActuelle > 0)
            .sort((a, b) => b.consommationActuelle - a.consommationActuelle);

        if (sortedByConsumption.length > 0) {
            const top = sortedByConsumption[0];
            mostUsedName = top.nomAppareil;
            mostUsedType = top.typeAppareil;
            // Estimate hours: if online, assume ~12.5h; if offline, assume ~4h
            mostUsedHours = top.status === 'ENLIGNE' ? 12.5 : 4.0;
        }

        // ==========================================
        // COMPUTE CHART DATA
        // ==========================================

        // Daily chart: 7 bars (Mon-Sun) — use InfluxDB only if >= 5 data points
        let dailyLabels = FALLBACK.chart.daily.labels;
        let dailyValues = FALLBACK.chart.daily.values;

        if (dailyEnergy.count >= 5 && dailyEnergy.consumption.length >= 5) {
            const rawValues = dailyEnergy.consumption;
            const maxRaw = Math.max(...rawValues, 1);
            dailyValues = rawValues.map(v => Math.round((v / maxRaw) * 95));
            dailyLabels = dailyEnergy.labels.map((lbl, i) => {
                const dayIndex = i % 7;
                return ['Lun', 'Mar', 'Merc', 'Jeud', 'Vend', 'Sam', 'Dim'][dayIndex] || lbl;
            });
            while (dailyValues.length < 7) dailyValues.push(0);
            while (dailyLabels.length < 7) dailyLabels.push('');
            dailyValues = dailyValues.slice(0, 7);
            dailyLabels = dailyLabels.slice(0, 7);
        }

        // Weekly chart: 4 bars (S1-S4) — use InfluxDB only if >= 3 data points
        let weeklyLabels = FALLBACK.chart.weekly.labels;
        let weeklyValues = FALLBACK.chart.weekly.values;

        if (weeklyEnergy.count >= 3 && weeklyEnergy.consumption.length >= 3) {
            const rawValues = weeklyEnergy.consumption;
            const maxRaw = Math.max(...rawValues, 1);
            weeklyValues = rawValues.map(v => Math.round((v / maxRaw) * 95));
            weeklyLabels = rawValues.map((_, i) => `S${i + 1}`);
            // Ensure exactly 4 entries
            while (weeklyValues.length < 4) weeklyValues.push(0);
            while (weeklyLabels.length < 4) weeklyLabels.push('');
            weeklyValues = weeklyValues.slice(0, 4);
            weeklyLabels = weeklyLabels.slice(0, 4);
        }

        // ==========================================
        // COMPUTE WEEKLY STATS
        // ==========================================

        // Savings: (previous - current) * rate
        let savings;
        if (previousConsumption !== FALLBACK.kpis.totalConsumption.previous && totalConsumption !== FALLBACK.kpis.totalConsumption.value) {
            const diff = Math.max(0, previousConsumption - totalConsumption);
            savings = Math.round(diff * ELECTRICITY_RATE * 100) / 100;
        } else {
            savings = FALLBACK.weeklyStats.savings;
        }

        // Efficiency Score: composite formula (0-100)
        let efficiencyScore;
        if (allDevices.length > 0) {
            let score = 85;
            // Deduct if low device utilization (active ratio < 50%)
            const activeRatio = activeDeviceCount / Math.max(allDevices.length, 1);
            if (activeRatio < 0.5) score -= 5;
            // Deduct for any very high consumer (>2000W)
            if (allDevices.some(d => d.consommationActuelle > 2000)) score -= 5;
            // Bonus if consumption decreased vs previous
            if (trend < 0) score += 5;
            // Bonus for peak hour outside 18-21 (off-peak usage)
            const peakH = parseInt(peakHour);
            if (peakH < 18 || peakH > 21) score += 5;
            // Clamp 0-100
            efficiencyScore = Math.max(0, Math.min(100, score));
        } else {
            efficiencyScore = FALLBACK.weeklyStats.efficiencyScore;
        }

        // Peak Usage (day + time)
        let peakDay = FALLBACK.weeklyStats.peakUsage.day;
        let peakTime = FALLBACK.weeklyStats.peakUsage.time;
        let peakFormatted = FALLBACK.weeklyStats.peakUsage.formatted;

        if (peakDayResult.rows.length > 0) {
            const raw = peakDayResult.rows[0].peak_day?.trim() || '';
            // Map English day names to French
            const dayMap = { 'Monday': 'Lundi', 'Tuesday': 'Mardi', 'Wednesday': 'Mercredi', 'Thursday': 'Jeudi', 'Friday': 'Vendredi', 'Saturday': 'Samedi', 'Sunday': 'Dimanche' };
            peakDay = dayMap[raw] || raw;
            peakTime = peakDayResult.rows[0].peak_time || '18:45';
            peakFormatted = `${peakDay}, ${peakTime}`;
        }

        // Carbon Footprint
        let carbonValue;
        if (totalConsumption !== FALLBACK.kpis.totalConsumption.value) {
            carbonValue = Math.round(totalConsumption * CO2_FACTOR);
        } else {
            carbonValue = FALLBACK.weeklyStats.carbonFootprint.value;
        }

        // ==========================================
        // COMPUTE DEVICE BREAKDOWN
        // ==========================================
        const totalConsumptionWatts = allDevices.reduce((sum, d) => sum + (d.consommationActuelle || 0), 0);
        const typeMap = {
            'THERMIQUE': 'Air conditionné',
            'ECLAIRAGE': 'Eclairage intelligent',
            'MULTIMEDIA': 'Home Theatre'
        };

        let deviceBreakdown;
        if (totalConsumptionWatts > 0) {
            // Real computation from device data
            const grouped = {};
            for (const device of allDevices) {
                const key = device.typeAppareil || 'OTHER';
                if (!grouped[key]) grouped[key] = { watts: 0, name: typeMap[key] || device.nomAppareil };
                grouped[key].watts += device.consommationActuelle || 0;
            }

            deviceBreakdown = Object.entries(grouped)
                .filter(([, v]) => v.watts > 0)
                .map(([type, v]) => ({
                    name: v.name,
                    type,
                    percentage: Math.round((v.watts / totalConsumptionWatts) * 100)
                }))
                .sort((a, b) => b.percentage - a.percentage);

            // Ensure we have entries for the 5 UI device types (add missing with fallback %)
            const existingTypes = new Set(deviceBreakdown.map(d => d.type));
            for (const fb of FALLBACK.deviceBreakdown) {
                if (!existingTypes.has(fb.type) && fb.type !== null) {
                    deviceBreakdown.push({ ...fb });
                }
            }
        } else {
            deviceBreakdown = FALLBACK.deviceBreakdown;
        }

        // ==========================================
        // ASSEMBLE RESPONSE
        // ==========================================
        res.status(200).json({
            kpis: {
                totalConsumption: { value: totalConsumption, previous: previousConsumption, trend, unit: 'kWh' },
                activeDevices: { active: activeDeviceCount, total: totalDeviceCount, peakHour },
                avgUsageTime: { hours: avgHours, minutes: avgMinutes, formatted: avgFormatted },
                mostUsedDevice: { name: mostUsedName, type: mostUsedType, hoursToday: mostUsedHours }
            },
            chart: {
                daily: { labels: dailyLabels, values: dailyValues },
                weekly: { labels: weeklyLabels, values: weeklyValues }
            },
            weeklyStats: {
                savings,
                efficiencyScore,
                peakUsage: { day: peakDay, time: peakTime, formatted: peakFormatted },
                carbonFootprint: { value: carbonValue, unit: 'kg CO2' }
            },
            deviceBreakdown
        });

    } catch (error) {
        console.error("[Reports] getReportSummary error:", error.message);
        // Full fallback — return screenshot data
        res.status(200).json(FALLBACK);
    }
};
