pipeline {
    agent any

    stages {
        stage('Récupération du Code') {
            steps {
                echo 'Récupération du code source depuis GitHub...'
                // Cette commande récupère automatiquement le code du dépôt configuré
                checkout scm
            }
        }

        stage('Démarrage des Services') {
            steps {
                echo 'Lancement des conteneurs via Docker Compose...'
                /* On utilise "docker compose" (sans le tiret) pour les versions récentes.
                   Le flag -d permet de lancer en arrière-plan.
                */
                sh 'docker compose up -d'
            }
        }

        stage('Vérification du Déploiement') {
            steps {
                echo 'Vérification de l\'état des services en cours...'
                // Affiche la liste des conteneurs actifs pour confirmer le succès
                sh 'docker ps'
            }
        }
    }

    post {
        success {
            echo 'Félicitations ! Le déploiement s\'est terminé avec succès.'
        }
        failure {
            echo 'Erreur : Le pipeline a échoué. Veuillez vérifier les logs Docker.'
        }
    }
}