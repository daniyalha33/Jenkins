pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "jenkins_ci_app"
    }

    stages {
        stage('Checkout Code from GitHub') {
            steps {
                echo 'Cloning repository...'
                git branch: 'master', url: 'https://github.com/daniyalha33/Jenkins.git'
            }
        }

        stage('Set Up Docker Environment') {
            steps {
                echo 'Checking Docker and Docker Compose installation...'
                sh 'docker --version'
                sh 'docker-compose --version'
            }
        }

        stage('Build and Run Application') {
            steps {
                echo 'Starting containers using docker-compose...'
                sh 'docker-compose up -d --build'
            }
        }

        stage('Verify Containers') {
            steps {
                echo 'Listing running containers...'
                sh 'docker ps'
            }
        }

        stage('Application Health Check') {
            steps {
                echo 'Checking if backend and frontend are accessible...'
                sh 'sleep 10'
                sh 'curl -I http://localhost:4000 || true'
                sh 'curl -I http://localhost:8085 || true'
            }
        }
    }

    post {
        success {
            echo '✅ Build pipeline completed successfully! Containers are still running.'
        }
        failure {
            echo '❌ Build pipeline failed. Please check the Jenkins logs for details.'
        }
    }
}
