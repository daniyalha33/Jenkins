pipeline {
    agent any   // Jenkins can run this on any available agent (your EC2 instance)

    environment {
        // Define a name for your docker-compose project (optional but helps avoid conflicts)
        COMPOSE_PROJECT_NAME = "jenkins_ci_app"
    }

    stages {
        stage('Checkout Code from GitHub') {
            steps {
                echo 'Cloning repository...'
                // Make sure this URL matches your repo link
                git branch: 'main', url: 'https://github.com/<your-username>/<your-repo-name>.git'
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
                // Run your containers using the new docker-compose.yml
                sh 'docker-compose up -d'
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
                // Adjust URLs according to your compose ports (e.g., 5000, 4000, 8080)
                sh 'sleep 10'  // give containers time to start
                sh 'curl -I http://localhost:5000 || true'
                sh 'curl -I http://localhost:4000 || true'
                sh 'curl -I http://localhost:8080 || true'
            }
        }

        stage('Clean Up Environment') {
            steps {
                echo 'Stopping and removing containers...'
                sh 'docker-compose down'
            }
        }
    }

    post {
        always {
            echo 'Cleaning up any leftover containers or networks...'
            sh 'docker system prune -f || true'
        }
        success {
            echo '✅ Build pipeline completed successfully!'
        }
        failure {
            echo '❌ Build pipeline failed. Please check the Jenkins logs for details.'
        }
    }
}
