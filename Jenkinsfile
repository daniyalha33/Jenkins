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
        stage('Application Health Check') {
            steps {
                echo '🩺 Checking if frontend and backend are accessible...'
                sh '''
                    echo "Waiting for services to start..."
                    sleep 30
                    
                    echo "Backend Health Check:"
                    for i in 1 2 3 4 5; do
                        if curl -f http://localhost:4000 > /dev/null 2>&1; then
                            echo "✅ Backend is UP"
                            curl http://localhost:4000
                            break
                        else
                            echo "Attempt $i/5: Backend not ready, waiting..."
                            sleep 10
                        fi
                    done
                    
                    echo "\nFrontend Health Check:"
                    for i in 1 2 3 4 5; do
                        if curl -f http://localhost:8085 > /dev/null 2>&1; then
                            echo "✅ Frontend is UP"
                            break
                        else
                            echo "Attempt $i/5: Frontend not ready, waiting..."
                            sleep 10
                        fi
                    done
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
                        # Create Dockerfile for Selenium tests
                        cat > Dockerfile << 'EOF'
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    curl \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Install ChromeDriver
RUN CHROMEDRIVER_VERSION=\$(curl -sS chromedriver.storage.googleapis.com/LATEST_RELEASE) && \\
    wget -q -O /tmp/chromedriver.zip https://chromedriver.storage.googleapis.com/\$CHROMEDRIVER_VERSION/chromedriver_linux64.zip && \\
    unzip /tmp/chromedriver.zip -d /usr/local/bin/ && \\
    rm /tmp/chromedriver.zip && \\
    chmod +x /usr/local/bin/chromedriver

# Set working directory
WORKDIR /tests

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy test files
COPY . .

# Run tests
CMD ["pytest", "--headless", "--maxfail=1", "--disable-warnings", "-v"]
EOF
                        
                        echo "✅ Dockerfile created"
                        cat Dockerfile
                        
                        # Build the test image
                        docker build -t selenium_tests:latest .
                    '''
                }
            }
        }
        stage('Run Selenium Tests in Container') {
            steps {
                echo '🖥️ Running Selenium tests in containerized environment...'
                sh '''
                    # Run tests in Docker container connected to app network
                    docker run --rm \
                        --name selenium_tests \
                        --network jenkins_ci_app_default \
                        -e BASE_URL=http://frontend_ci:5173 \
                        -e BACKEND_URL=http://backend_ci:3000 \
                        -v $(pwd)/selenium_tests:/tests \
                        selenium_tests:latest
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
                    
                    <h3>Action Required:</h3>
                    <p>Please check the console output to identify the issue.</p>
                    
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
                
                echo "\n=== Backend Logs (last 50 lines) ==="
                docker logs backend_ci --tail 50 || true
                
                echo "\n=== Frontend Logs (last 50 lines) ==="
                docker logs frontend_ci --tail 50 || true
                
                echo "\n=== Docker Network Info ==="
                docker network inspect jenkins_ci_app_default || true
            '''
        }
        cleanup {
            echo '🧹 Cleaning up test artifacts...'
            sh '''
                # Clean up test container image
                docker rmi selenium_tests:latest || true
            '''
        }
    }
}
