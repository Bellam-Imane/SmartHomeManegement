

# 🏠 Smart Home Web Application - FP Taroudant

## 📌 Présentation du Projet
Ce projet, réalisé dans le cadre de la filière **Génie Informatique** à la **Faculté Polydisciplinaire de Taroudant**, vise à développer une plateforme web complète pour la gestion et la supervision d'une maison intelligente. 

L'objectif est d'offrir une solution centralisée pour contrôler les équipements domestiques, optimiser la consommation énergétique et renforcer la sécurité grâce aux technologies **IoT** et **Intelligence Artificielle**.

## 👥 Équipe du Projet
- **Ghizlane Essahraoui**
- **Imane Bellam**
- **Riham Aitebella**
- **Encadrant :** Mme. Mouhim Sanaa

## 🛠️ Stack Technique
- **Frontend :** Interface Web Interactive & Responsive (HTML5, CSS3, JavaScript/React ou Vue).
- **Backend :** Node.js avec Express.
- **Communication IoT :** Protocole **MQTT** pour le temps réel.
- **Bases de Données :**
    - **PostgreSQL :** Pour les données relationnelles (utilisateurs, configurations, scénarios).
    - **InfluxDB / MongoDB :** Pour les données de séries temporelles (historique des capteurs).
- **Sécurité :** Authentification par tokens API et communication HTTPS.

## 🌟 Fonctionnalités Principales
- **Module Appareils :** Gestion (CRUD) des équipements (Lumières, Climatisation, Portes, etc.).
- **Suivi Énergétique :** Monitoring en temps réel avec alertes en cas de surconsommation.
- **Sécurité & Surveillance :** Gestion des caméras, détecteurs de mouvement et alarmes.
- **Automatisation & IA :** Création de scénarios (Morning routine, Night mode) et suggestions intelligentes basées sur les habitudes.
- **Gestion des Pièces :** Modélisation virtuelle du domicile (Salon, Cuisine, Chambres).
- **Rapports & Statistiques :** Visualisation graphique de l'utilisation des ressources.

## 🏗️ Architecture du Système
L'application repose sur une architecture découplée :
1. **Frontend :** Interaction utilisateur et dashboard interactif.
2. **Backend :** Logique métier, gestion des rôles (Owner, Family, Guest) et passerelle MQTT.
3. **Persistance Polyglotte :** Utilisation de bases de données relationnelles et temporelles pour une performance optimale.

## 📋 Exigences du Système
- **Performance :** Temps de réponse inférieur à 3 secondes.
- **Sécurité :** Gestion stricte des sessions et des privilèges.
- **Portabilité :** Compatible Desktop, Tablette et Smartphone.

---
*Année Universitaire : 2025/2026 - Université Ibn Zohr*
