pipeline {
  agent any
  triggers { githubPush() }
  environment {
    AWS_REGION = 'ap-south-1'
    VERSION    = "1.0.${env.BUILD_NUMBER}"
  }
  stages {
    stage('Checkout') {
      steps { checkout scm }
    }
    stage('ECR Login') {
      steps {
        sh '''
          ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
          echo "$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com" > .registry
          aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(cat .registry)
        '''
      }
    }
    stage('Build & Push Images') {
      steps {
        sh '''
          REG=$(cat .registry)
          bp() {
            name=$1; shift
            aws ecr describe-repositories --repository-names streaming-$name --region $AWS_REGION >/dev/null 2>&1 || \
              aws ecr create-repository --repository-name streaming-$name --region $AWS_REGION >/dev/null
            docker build -t $REG/streaming-$name:$VERSION -t $REG/streaming-$name:latest "$@"
            docker push $REG/streaming-$name:$VERSION
            docker push $REG/streaming-$name:latest
          }
          bp auth   backend/authService
          bp stream -f backend/streamingService/Dockerfile backend
          bp admin  -f backend/adminService/Dockerfile backend
          bp chat   -f backend/chatService/Dockerfile backend
          bp frontend \
            --build-arg REACT_APP_AUTH_API_URL=/api/auth \
            --build-arg REACT_APP_STREAMING_API_URL=/api \
            --build-arg REACT_APP_STREAMING_PUBLIC_URL=/ \
            --build-arg REACT_APP_ADMIN_API_URL=/api/admin \
            --build-arg REACT_APP_CHAT_API_URL=/api/chat \
            --build-arg REACT_APP_CHAT_SOCKET_URL=/ \
            frontend
        '''
      }
    }
  }
  post {
    always  { sh 'docker image prune -f || true' }
    success { echo "Pushed all images with tag ${VERSION}" }
    failure { echo 'Build failed' }
  }
}
