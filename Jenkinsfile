pipeline {
    agent any
    environment {
        COMPOSE_PROJECT_NAME = "jenkins_ci_app"
        APP_REPO = 'https://github.com/daniyalha33/Jenkins.git'
        TEST_REPO = 'https://github.com/daniyalha33/selenium_test_cases.git'
        EC2_IP = '34.239.165.164'
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
                    docker compose version
                '''
            }
        }
        stage('Clean Previous Containers') {
            steps {
                echo '🧹 Cleaning up old containers...'
                sh '''
                    docker rm -f backend_ci frontend_ci selenium_tests || true
                    docker ps -aq --filter "name=_ci" | xargs -r docker rm -f || true
                    docker compose down --volumes --remove-orphans || true
                    docker system prune -af
                    docker volume prune -f
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
        stage('Wait for Services') {
            steps {
                echo '⏳ Waiting for services to be ready...'
                sh '''
                    echo "Waiting 30 seconds for npm install and startup..."
                    sleep 30
                    
                    echo "\n=== Checking Backend Logs ==="
                    docker logs backend_ci --tail 20 || true
                    
                    echo "\n=== Checking Frontend Logs ==="
                    docker logs frontend_ci --tail 20 || true
                '''
            }
        }
        stage('Application Health Check') {
            steps {
                echo '🩺 Verifying application accessibility...'
                sh '''
                    MAX_ATTEMPTS=10
                    SLEEP_TIME=10
                    
                    # Backend Health Check
                    echo "Checking Backend (port 4000)..."
                    for i in $(seq 1 $MAX_ATTEMPTS); do
                        if curl -f -s http://localhost:4000 > /dev/null 2>&1; then
                            echo "✅ Backend is UP and responding!"
                            curl -s http://localhost:4000 | head -20
                            BACKEND_UP=true
                            break
                        else
                            echo "Attempt $i/$MAX_ATTEMPTS: Backend not ready, waiting ${SLEEP_TIME}s..."
                            sleep $SLEEP_TIME
                        fi
                    done
                    
                    if [ "$BACKEND_UP" != "true" ]; then
                        echo "❌ Backend failed to start"
                        docker logs backend_ci --tail 50
                        exit 1
                    fi
                    
                    # Frontend Health Check
                    echo "\nChecking Frontend (port 8085)..."
                    for i in $(seq 1 $MAX_ATTEMPTS); do
                        if curl -f -s http://localhost:8085 > /dev/null 2>&1; then
                            echo "✅ Frontend is UP and responding!"
                            FRONTEND_UP=true
                            break
                        else
                            echo "Attempt $i/$MAX_ATTEMPTS: Frontend not ready, waiting ${SLEEP_TIME}s..."
                            sleep $SLEEP_TIME
                        fi
                    done
                    
                    if [ "$FRONTEND_UP" != "true" ]; then
                        echo "❌ Frontend failed to start"
                        docker logs frontend_ci --tail 50
                        exit 1
                    fi
                    
                    echo "\n✅ All services are healthy!"
                '''
            }
        }
        stage('Checkout Selenium Tests') {
            steps {
                echo '🧪 Cloning Selenium test repository...'
                dir('selenium_tests') {
                    git branch: 'master', url: "${TEST_REPO}"
                }
            }
        }
        stage('Build Test Container') {
            steps {
                echo '🐳 Building Selenium test Docker image...'
                dir('selenium_tests') {
                    sh '''
                        # Create Dockerfile with fixed Chrome installation
                        cat > Dockerfile << 'DOCKERFILE'
FROM python:3.9-slim

# Install basic dependencies
RUN apt-get update && apt-get install -y \\
    wget \\
    gnupg \\
    unzip \\
    curl \\
    ca-certificates \\
    && rm -rf /var/lib/apt/lists/*

# Install Chrome using the new method (without apt-key)
RUN wget -q -O /tmp/google-chrome-stable_current_amd64.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \\
    && apt-get update \\
    && apt-get install -y /tmp/google-chrome-stable_current_amd64.deb \\
    && rm /tmp/google-chrome-stable_current_amd64.deb \\
    && rm -rf /var/lib/apt/lists/*

# Install ChromeDriver
RUN CHROMEDRIVER_VERSION=$(wget -qO- https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json | grep -oP '"version":"\\K[^"]+' | head -1) && \\
    wget -q -O /tmp/chromedriver-linux64.zip "https://edgedl.me.gvt1.com/edgedl/chrome/chrome-for-testing/$CHROMEDRIVER_VERSION/linux64/chromedriver-linux64.zip" && \\
    unzip /tmp/chromedriver-linux64.zip -d /tmp/ && \\
    mv /tmp/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver && \\
    chmod +x /usr/local/bin/chromedriver && \\
    rm -rf /tmp/chromedriver-linux64.zip /tmp/chromedriver-linux64

# Verify installations
RUN google-chrome --version && chromedriver --version

# Set working directory
WORKDIR /tests

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy test files
COPY . .

# Run tests
CMD ["pytest", "--headless", "--maxfail=1", "--disable-warnings", "-v"]
DOCKERFILE
                        
                        echo "✅ Dockerfile created successfully"
                        echo "Building Docker image..."
                        docker build -t selenium_tests:latest .
                        echo "✅ Docker image built successfully"
                    '''
                }
            }
        }
        stage('Run Selenium Tests in Container') {
            steps {
                echo '🖥️ Running Selenium tests in containerized environment...'
                sh '''
                    echo "Starting test container..."
                    
                    # Run tests connected to the same network as the app
                    docker run --rm \\
                        --name selenium_tests \\
                        --network jenkins_ci_app_default \\
                        -e BASE_URL=http://frontend_ci:5173 \\
                        -e BACKEND_URL=http://backend_ci:3000 \\
                        selenium_tests:latest
                    
                    echo "✅ Tests completed successfully!"
                '''
            }
        }
    }
    post {
        success {
            echo '✅ Build and Selenium tests completed successfully!'
            emailext(
                subject: "✅ Jenkins CI/CD Pipeline Successful - Build #${BUILD_NUMBER}",
                body: """
                    <h2>🎉 Build Successful!</h2>
                    <p>All stages completed successfully. Selenium tests passed in containerized environment.</p>
                    
                    <h3>Build Information:</h3>
                    <ul>
                        <li><strong>Build Number:</strong> ${BUILD_NUMBER}</li>
                        <li><strong>Project:</strong> ${JOB_NAME}</li>
                        <li><strong>Duration:</strong> ${currentBuild.durationString}</li>
                        <li><strong>Status:</strong> SUCCESS ✅</li>
                    </ul>
                    
                    <h3>Application URLs:</h3>
                    <ul>
                        <li><strong>Frontend:</strong> <a href="http://${EC2_IP}:8085">http://${EC2_IP}:8085</a></li>
                        <li><strong>Backend:</strong> <a href="http://${EC2_IP}:4000">http://${EC2_IP}:4000</a></li>
                    </ul>
                    
                    <h3>Test Execution:</h3>
                    <p>✅ Selenium tests executed in isolated Docker container</p>
                    <p>✅ All test cases passed</p>
                    
                    <p><a href="${BUILD_URL}">View Build Details</a> | <a href="${BUILD_URL}console">View Console Output</a></p>
                """,
                to: "daniyalha33@gmail.com",
                mimeType: 'text/html'
            )
        }
        failure {
            echo '❌ Pipeline failed. Check Jenkins logs.'
            emailext(
                subject: "❌ Jenkins CI/CD Pipeline Failed - Build #${BUILD_NUMBER}",
                body: """
                    <h2>❌ Build Failed</h2>
                    <p>The pipeline encountered an error.</p>
                    
                    <h3>Build Information:</h3>
                    <ul>
                        <li><strong>Build Number:</strong> ${BUILD_NUMBER}</li>
                        <li><strong>Project:</strong> ${JOB_NAME}</li>
                        <li><strong>Duration:</strong> ${currentBuild.durationString}</li>
                        <li><strong>Status:</strong> FAILURE ❌</li>
                    </ul>
                    
                    <p><a href="${BUILD_URL}">View Build Details</a> | <a href="${BUILD_URL}console">View Console Output</a></p>
                """,
                to: "daniyalha33@gmail.com",
                mimeType: 'text/html'
            )
        }
        always {
            echo '📊 Pipeline execution completed'
            sh '''
                echo "=== Currently Running Containers ==="
                docker ps
                
                echo "\n=== Backend Logs (last 30 lines) ==="
                docker logs backend_ci --tail 30 || true
                
                echo "\n=== Frontend Logs (last 30 lines) ==="
                docker logs frontend_ci --tail 30 || true
            '''
        }
        cleanup {
            echo '🧹 Cleaning up test artifacts...'
            sh '''
                docker rmi selenium_tests:latest || true
            '''
        }
    }
}
