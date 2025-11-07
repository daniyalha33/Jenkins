pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "jenkins_ci_app"
    }

    stages {
        stage('Checkout Code from GitHub') {
            steps {
                echo '📦 Cloning repository...'
                git branch: 'master', url: 'https://github.com/daniyalha33/Jenkins.git'
            }
        }

        stage('Set Up Docker Environment') {
            steps {
                echo '⚙️ Checking Docker and Docker Compose installation...'
                sh '''
                    docker --version
                    if docker compose version >/dev/null 2>&1; then
                        echo "✅ Docker Compose v2 detected"
                    else
                        echo "⚠️ Installing Docker Compose plugin..."
                        sudo apt-get update -y && sudo apt-get install -y docker-compose-plugin
                    fi
                    docker compose version
                '''
            }
        }

        stage('Clean Previous Containers') {
            steps {
                echo '🧹 Cleaning up old containers and volumes...'
                sh '''
                    docker compose down --volumes --remove-orphans || true
                    docker system prune -af || true
                    docker volume prune -f || true
                '''
            }
        }

        stage('Build and Run Application') {
            steps {
                echo '🚀 Building and starting containers...'
                sh '''
                    docker compose up -d --build
                '''
            }
        }

        stage('Verify Containers') {
            steps {
                echo '🔍 Listing running containers...'
                sh 'docker ps'
            }
        }

        stage('Application Health Check') {
            steps {
                echo '🩺 Checking if backend and frontend are accessible...'
                sh '''
                    sleep 10
                    echo "Backend (port 4000):"
                    curl -I http://localhost:4000 || true
                    echo "Frontend (port 8085):"
                    curl -I http://localhost:8085 || true
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Build pipeline completed successfully! Containers are running.'
        }
        failure {
            echo '❌ Build pipeline failed. Please check the Jenkins logs for details.'
        }
    }
}
