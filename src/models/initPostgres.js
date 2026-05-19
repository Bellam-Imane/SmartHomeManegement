/**
 * initPostgres.js
 * Ce script initialise toutes les tables nécessaires pour le suivi historique et l'automatisation
 */
const { pgPool } = require('../config/db'); // ✅ pgPool بدل pool

const initializePostgres = async () => {
  const createTablesQuery = `
    -- 1. Table pour l'historique des données des appareils (Lien avec MongoDB)
    CREATE TABLE IF NOT EXISTS historique_donnees (
        id SERIAL PRIMARY KEY,
        mongo_device_id VARCHAR(24) NOT NULL, 
        type_evenement VARCHAR(50),           -- Ex: 'CHANGEMENT_ETAT', 'CONSOMMATION'
        valeur_ancienne TEXT,
        valeur_nouvelle TEXT,
        date_evenement TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Table pour les logs du système d'automatisation (Règles exécutées)
    CREATE TABLE IF NOT EXISTS logs_automation (
        id SERIAL PRIMARY KEY,
        regle_id VARCHAR(24),                 -- ID de la règle déclenchée
        message_log TEXT,                     -- Description de ce qui s'est passé
        statut VARCHAR(20),                   -- Ex: 'SUCCES', 'ERREUR'
        date_log TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 3. Table pour stocker les notifications envoyées aux membres
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(24),                  -- ID du membre dans MongoDB
        titre VARCHAR(100),
        message TEXT,
        est_lu BOOLEAN DEFAULT FALSE,         -- État de lecture
        date_notification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- 4. Table pour le suivi de la consommation énergétique par appareil
    CREATE TABLE IF NOT EXISTS consommation_energie (
        id SERIAL PRIMARY KEY,
        mongo_device_id VARCHAR(24) NOT NULL, -- ID de l'appareil concerné
        consommation_kwh DECIMAL(10, 4),      -- La valeur consommée (ex: 0.520 kWh)
        puissance_watt INTEGER,               -- Puissance instantanée en Watts
        date_mesure TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    const client = await pgPool.connect(); // ✅ pgPool بدل pool
    await client.query(createTablesQuery);
    console.log("✅ PostgreSQL: Toutes les tables (Historique, Logs, Notifications) sont prêtes !");
    client.release();
  } catch (err) {
    console.error("❌ PostgreSQL: Erreur lors de la création des tables", err.message);
  }
};

module.exports = initializePostgres;