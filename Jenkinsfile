pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                echo 'Pulling code from GitHub...'
                checkout scm
            }
        }

        stage('Check Docker Environment') {
            steps {
                echo 'Checking Docker & Compose versions...'
                bat 'docker version'
                bat 'docker compose version'
            }
        }

        stage('Start Databases (Docker Compose)') {
            steps {
                echo 'Starting PostgreSQL, MongoDB, InfluxDB...'
                bat 'docker compose -f docker-compose.yml up -d'
            }
        }

        stage('Verify Containers') {
            steps {
                echo 'Listing running containers...'
                bat 'docker ps'
            }
        }
    }

    post {
        success {
            echo '✅ Smart Home infrastructure deployed successfully!'
        }

        failure {
            echo '❌ Pipeline failed. Check Docker logs.'
            bat 'docker ps -a'
        }
    }
}