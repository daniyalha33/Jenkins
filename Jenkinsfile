pipeline {
    agent any
    environment {
        COMPOSE_PROJECT_NAME = "jenkins_ci_app"
        APP_REPO = 'https://github.com/daniyalha33/Jenkins.git'
        TEST_REPO = 'https://github.com/daniyalha33/selenium_test_cases.git'
        EC2_IP = '98.93.87.2'
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
                    docker ps -aq --filter "name=selenium" | xargs -r docker rm -f || true
                    docker compose down --volumes --remove-orphans || true
                    docker system prune -af
                    docker volume prune -f
                    docker rmi selenium_tests:latest || true
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
                    echo "Waiting 40 seconds for npm install and startup..."
                    sleep 40
                    
                    echo "\n=== Checking Backend Logs ==="
                    docker logs backend_ci --tail 20
                    
                    echo "\n=== Checking Frontend Logs ==="
                    docker logs frontend_ci --tail 20
                '''
            }
        }
        stage('Application Health Check') {
            steps {
                echo '🩺 Verifying application accessibility...'
                sh '''
                    # Check if backend container is running and logs show "Server is running"
                    echo "Checking Backend container status..."
                    if docker logs backend_ci 2>&1 | grep -q "Server is running"; then
                        echo "✅ Backend is UP (server started)"
                    else
                        echo "❌ Backend server not started"
                        docker logs backend_ci --tail 50
                        exit 1
                    fi
                    
                    # Try curl anyway (some backends might have endpoints)
                    echo "\nTrying Backend HTTP endpoint..."
                    curl -s http://localhost:4000 || echo "Note: No HTTP endpoint at root (this is OK if backend is API-only)"
                    
                    # Check if frontend container is running and Vite started
                    echo "\nChecking Frontend container status..."
                    if docker logs frontend_ci 2>&1 | grep -q "ready in"; then
                        echo "✅ Frontend is UP (Vite started)"
                    else
                        echo "❌ Frontend Vite not started"
                        docker logs frontend_ci --tail 50
                        exit 1
                    fi
                    
                    # Verify frontend is accessible
                    echo "\nVerifying Frontend HTTP endpoint..."
                    MAX_ATTEMPTS=5
                    for i in $(seq 1 $MAX_ATTEMPTS); do
                        if curl -f -s http://localhost:8085 > /dev/null 2>&1; then
                            echo "✅ Frontend HTTP endpoint is accessible"
                            break
                        else
                            if [ $i -eq $MAX_ATTEMPTS ]; then
                                echo "❌ Frontend not accessible after $MAX_ATTEMPTS attempts"
                                exit 1
                            fi
                            echo "Attempt $i/$MAX_ATTEMPTS: waiting..."
                            sleep 5
                        fi
                    done
                    
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
                        echo "Creating Dockerfile for Selenium tests..."
                        
                        # Create a compatible requirements.txt file (including webdriver_manager to avoid import errors)
                        cat > requirements_fixed.txt << 'EOF'
selenium==4.15.0
pytest==7.4.4
pytest-html==4.1.1
webdriver-manager==4.0.1
EOF
                        
                        # Create a modified conftest.py to override BASE_URL and fixture
                        cat > conftest.py << 'EOFCONFTEST'
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import os

# Override BASE_URL for Docker environment
BASE_URL = os.getenv('BASE_URL', 'http://frontend_ci:5173')

@pytest.fixture
def driver():
    """Override the driver fixture from test files"""
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    # Use the system ChromeDriver (already installed in container)
    service = Service('/usr/local/bin/chromedriver')
    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(10)
    
    yield driver
    driver.quit()

# Make BASE_URL available to all test modules
def pytest_configure(config):
    """Set BASE_URL in all test modules"""
    import sys
    for module_name in list(sys.modules.keys()):
        if module_name.startswith('test_'):
            module = sys.modules[module_name]
            if hasattr(module, '__dict__'):
                module.__dict__['BASE_URL'] = BASE_URL
EOFCONFTEST
                        
                        cat > Dockerfile << 'EOFDOCKERFILE'
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    wget \\
    gnupg \\
    unzip \\
    curl \\
    ca-certificates \\
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome directly via .deb package
RUN wget -q -O /tmp/google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \\
    && apt-get update \\
    && apt-get install -y /tmp/google-chrome.deb \\
    && rm /tmp/google-chrome.deb \\
    && rm -rf /var/lib/apt/lists/*

# Install ChromeDriver
RUN CHROMEDRIVER_VERSION=$(wget -qO- "https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json" | grep -oP '"version":"\\K[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' | head -1) \\
    && echo "Installing ChromeDriver version: $CHROMEDRIVER_VERSION" \\
    && wget -q -O /tmp/chromedriver.zip "https://storage.googleapis.com/chrome-for-testing-public/$CHROMEDRIVER_VERSION/linux64/chromedriver-linux64.zip" \\
    && unzip /tmp/chromedriver.zip -d /tmp/ \\
    && mv /tmp/chromedriver-linux64/chromedriver /usr/local/bin/chromedriver \\
    && chmod +x /usr/local/bin/chromedriver \\
    && rm -rf /tmp/chromedriver.zip /tmp/chromedriver-linux64

# Verify installations
RUN echo "Verifying installations..." \\
    && google-chrome --version \\
    && chromedriver --version

# Set working directory
WORKDIR /tests

# Copy fixed requirements file
COPY requirements_fixed.txt requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy test files
COPY . .

# Run tests
CMD ["pytest", "-v", "--tb=short", "--maxfail=1"]
EOFDOCKERFILE

                        echo "✅ Dockerfile created"
                        echo "✅ conftest.py created"
                        echo "✅ requirements_fixed.txt created"
                        
                        echo "\nBuilding Docker image..."
                        docker build -t selenium_tests:latest .
                        
                        echo "✅ Docker image built successfully"
                        docker images | grep selenium_tests
                    '''
                }
            }
        }
        stage('Run Selenium Tests in Container') {
            steps {
                echo '🖥️ Running Selenium tests in containerized environment...'
                sh '''
                    echo "=== Docker Network Info ==="
                    docker network ls | grep jenkins_ci_app
                    
                    echo "\n=== Starting Test Container ==="
                    docker run --rm \\
                        --name selenium_tests \\
                        --network jenkins_ci_app_default \\
                        -e BASE_URL=http://frontend_ci:5173 \\
                        -e BACKEND_URL=http://backend_ci:3000 \\
                        selenium_tests:latest
                    
                    echo "\n✅ All tests passed!"
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
                    <p>The pipeline encountered an error during execution.</p>
                    
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
                
                echo "\n=== Docker Images ==="
                docker images | grep -E "selenium_tests|node" || true
            '''
        }
        cleanup {
            echo '🧹 Cleaning up test artifacts...'
            sh '''
                docker rmi selenium_tests:latest || true
                rm -f selenium_tests/build.log || true
                rm -f test_output.log || true
            '''
        }
    }
}
