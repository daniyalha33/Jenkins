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
                echo '🧹 Cleaning up old containers and images...'
                sh '''
                    # Stop and remove containers
                    docker rm -f backend_ci frontend_ci selenium_tests 2>/dev/null || true
                    
                    # Clean up with docker compose
                    docker compose down --volumes --remove-orphans 2>/dev/null || true
                    
                    # Remove test image
                    docker rmi selenium_tests:latest 2>/dev/null || true
                    
                    # Prune system
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
                sh '''
                    docker ps
                    echo "\n=== Docker Network ==="
                    docker network ls | grep jenkins_ci_app || true
                '''
            }
        }
        
        stage('Wait for Services') {
            steps {
                echo '⏳ Waiting for services to be ready...'
                sh '''
                    echo "Waiting 40 seconds for npm install and startup..."
                    sleep 40
                    
                    echo "\n=== Backend Logs ==="
                    docker logs backend_ci --tail 20
                    
                    echo "\n=== Frontend Logs ==="
                    docker logs frontend_ci --tail 20
                '''
            }
        }
        
        stage('Application Health Check') {
            steps {
                echo '🩺 Verifying application health...'
                sh '''
                    # Check Backend
                    echo "Checking Backend..."
                    if docker logs backend_ci 2>&1 | grep -q "Server is running"; then
                        echo "✅ Backend is UP"
                    else
                        echo "❌ Backend not ready"
                        docker logs backend_ci --tail 50
                        exit 1
                    fi
                    
                    # Check Frontend
                    echo "\nChecking Frontend..."
                    if docker logs frontend_ci 2>&1 | grep -q "ready in"; then
                        echo "✅ Frontend is UP"
                    else
                        echo "❌ Frontend not ready"
                        docker logs frontend_ci --tail 50
                        exit 1
                    fi
                    
                    # Verify frontend accessibility
                    echo "\nVerifying Frontend HTTP endpoint..."
                    MAX_ATTEMPTS=5
                    for i in $(seq 1 $MAX_ATTEMPTS); do
                        if curl -f -s http://localhost:8085 > /dev/null 2>&1; then
                            echo "✅ Frontend HTTP endpoint accessible"
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
                        echo "Verifying test files..."
                        ls -la
                        
                        echo "\nBuilding Docker image..."
                        docker build -t selenium_tests:latest .
                        
                        echo "\n✅ Docker image built successfully"
                        docker images | grep selenium_tests
                    '''
                }
            }
        }
        
        stage('Run Selenium Tests') {
            steps {
                echo '🖥️ Running Selenium tests in containerized environment...'
                sh '''
                    echo "=== Docker Network Info ==="
                    docker network inspect jenkins_ci_app_default | grep -A 5 "Containers" || true
                    
                    echo "\n=== Starting Test Container ==="
                    docker run --rm \
                        --name selenium_tests \
                        --network jenkins_ci_app_default \
                        -e BASE_URL=http://frontend_ci:5173 \
                        -e BACKEND_URL=http://backend_ci:3000 \
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
                        <li><strong>Timestamp:</strong> ${new Date()}</li>
                    </ul>
                    
                    <h3>Application URLs:</h3>
                    <ul>
                        <li><strong>Frontend:</strong> <a href="http://${EC2_IP}:8085">http://${EC2_IP}:8085</a></li>
                        <li><strong>Backend:</strong> <a href="http://${EC2_IP}:4000">http://${EC2_IP}:4000</a></li>
                    </ul>
                    
                    <h3>Test Execution:</h3>
                    <p>✅ Selenium tests executed in isolated Docker container</p>
                    <p>✅ All test cases passed successfully</p>
                    <p>✅ Application verified on Docker network: jenkins_ci_app_default</p>
                    
                    <h3>Quick Actions:</h3>
                    <p>
                        <a href="${BUILD_URL}">View Build Details</a> | 
                        <a href="${BUILD_URL}console">View Console Output</a>
                    </p>
                    
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message from Jenkins CI/CD Pipeline.<br>
                        Application Repository: ${APP_REPO}<br>
                        Test Repository: ${TEST_REPO}
                    </p>
                """,
                to: "qasimalik@gmail.com",
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
                        <li><strong>Timestamp:</strong> ${new Date()}</li>
                    </ul>
                    
                    <h3>Failed Stage:</h3>
                    <p>${currentBuild.result}</p>
                    
                    <h3>Immediate Actions Required:</h3>
                    <ol>
                        <li>Check the console output for error details</li>
                        <li>Verify Docker containers are running properly</li>
                        <li>Check application logs for backend and frontend</li>
                        <li>Ensure test repository is accessible</li>
                    </ol>
                    
                    <h3>Quick Actions:</h3>
                    <p>
                        <a href="${BUILD_URL}">View Build Details</a> | 
                        <a href="${BUILD_URL}console">View Console Output</a>
                    </p>
                    
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message from Jenkins CI/CD Pipeline.
                    </p>
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
                docker logs backend_ci --tail 30 2>/dev/null || true
                
                echo "\n=== Frontend Logs (last 30 lines) ==="
                docker logs frontend_ci --tail 30 2>/dev/null || true
                
                echo "\n=== Docker Images ==="
                docker images | grep -E "selenium_tests|node" || true
                
                echo "\n=== Docker Networks ==="
                docker network ls | grep jenkins_ci_app || true
            '''
        }
        
        cleanup {
            echo '🧹 Cleaning up test artifacts...'
            sh '''
                # Remove test container image
                docker rmi selenium_tests:latest 2>/dev/null || true
                
                # Clean up test directory logs
                rm -f selenium_tests/build.log 2>/dev/null || true
                rm -f test_output.log 2>/dev/null || true
                
                echo "✅ Cleanup completed"
            '''
        }
    }
}
