pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "jenkins_ci_app"
        APP_REPO = 'https://github.com/daniyalha33/Jenkins.git'
        TEST_REPO = 'https://github.com/daniyalha33/selenium_test_cases.git'
        EC2_IP = '34.239.165.164/' // replace with your EC2 public IP
    }

    stages {
        stage('Checkout Application Code') {
            steps {
                echo '📦 Cloning application repository...'
                git branch: 'master', url: "${APP_REPO}"
            }
        }

        stage('Set Up Docker Environment') {
            steps {
                echo '⚙️ Checking Docker and Docker Compose...'
                sh '''
                    docker --version
                    docker compose version || true
                '''
            }
        }

        stage('Clean Previous Containers') {
    steps {
        echo '🧹 Cleaning up old containers...'
        sh '''
            # Stop and remove any container with name backend_ci or frontend_ci
            docker rm -f backend_ci frontend_ci || true

            # Remove any containers with _ci in name
            docker ps -aq --filter "name=_ci" | xargs -r docker rm -f || true

            docker compose down --volumes --remove-orphans || true
            docker system prune -af || true
            docker volume prune -f || true
        '''
    }
}

        stage('Build and Run Application') {
            steps {
                echo '🚀 Building and starting application containers...'
                sh 'docker compose up -d --build'
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
                echo '🩺 Checking if frontend and backend are accessible...'
                sh """
                    sleep 10
                    curl -I http://${EC2_IP}:4000 || true
                    curl -I http://${EC2_IP}:8085 || true
                """
            }
        }

        stage('Checkout Selenium Tests') {
            steps {
                echo '🧪 Cloning Selenium test repository...'
                git branch: 'master', url: "${TEST_REPO}"
            }
        }

        stage('Run Selenium Tests') {
            steps {
                echo '🖥️ Running Selenium tests in headless Chrome...'
                sh '''
                    # assuming tests are in Python and use pytest
                    pip install -r requirements.txt
                    pytest --headless --maxfail=1 --disable-warnings
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Build and Selenium tests completed successfully!'

            emailext(
                subject: "✅ Jenkins Build & Selenium Tests Successful",
                body: """
                    <p>Hello,</p>
                    <p>All stages completed successfully and Selenium test cases passed.</p>
                    <p>Frontend URL: <a href="http://${EC2_IP}:8085">http://${EC2_IP}:8085</a></p>
                    <p>Check build details: <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                """,
                to: "daniyalha33@gmail.com"
            )
        }

        failure {
            echo '❌ Pipeline failed. Check Jenkins logs.'

            emailext(
                subject: "❌ Jenkins Build or Selenium Tests Failed",
                body: """
                    <p>Hello,</p>
                    <p>The pipeline failed. Please check Jenkins logs.</p>
                    <p>Build details: <a href="${BUILD_URL}">${BUILD_URL}</a></p>
                """,
                to: "teacher-email@example.com"
            )
        }
    }
}
