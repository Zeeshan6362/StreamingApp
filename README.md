StreamingApp --- Container Orchestration on Kubernetes

A MERN-based streaming platform containerized with Docker and deployed
using Kubernetes, Helm, Ingress, Amazon EKS, and Amazon CloudWatch.

This project was completed as part of the Container Orchestration
Assignment --- StreamingApp on Kubernetes.

The platform consists of four Node.js backend microservices, a
React/Nginx frontend, and a shared MongoDB database.

1. Project Overview

Application Services

Component           Responsibility                            Port

Auth Service        Registration, login and JWT issuance      3001
Streaming Service   Video catalogue and playback APIs         3002
Admin Service       Asset management and signed uploads       3003
Chat Service        REST/WebSocket live chat                  3004
Frontend            React SPA served through Nginx              80
MongoDB             Shared application database              27017

The application was modeled as Kubernetes Deployments, Services,
ConfigMaps, Secrets, a MongoDB StatefulSet/PersistentVolumeClaim, and
Ingress resources.

2. Architecture

                         Internet / Browser
                                |
                                v
                    +-----------------------+
                    | Kubernetes Ingress    |
                    |       NGINX           |
                    +-----------+-----------+
                                |
              +-----------------+------------------+
              |                 |                  |
              v                 v                  v
        / (Frontend)      /api/auth          /api/streaming
              |                 |                  |
              v                 v                  v
       +-------------+   +-------------+    +-------------+
       |  Frontend   |   | Auth Service|    |  Streaming  |
       | React/Nginx |   |    :3001    |    |   :3002     |
       +-------------+   +------+------+    +------+------+
                                |                  |
                                |                  |
              +-----------------+------------------+
              |                                    |
              v                                    v
       /api/admin                            /api/chat
              |                                    |
              v                                    v
       +-------------+                      +-------------+
       | Admin       |                      | Chat        |
       | Service     |                      | Service     |
       |   :3003     |                      |   :3004     |
       +------+------+                      +------+------+
              |                                    |
              +----------------+-------------------+
                               |
                               v
                       +---------------+
                       |   MongoDB     |
                       |    :27017     |
                       +---------------+

             Kubernetes cluster: Amazon EKS
             Region: ap-south-1
             Monitoring/Logging: Amazon CloudWatch

3. Technology Stack

React

Node.js

Express

MongoDB

Docker

Docker Hub

Kubernetes

Amazon EKS

Helm 3

NGINX Ingress

Amazon CloudWatch

Git / GitHub

AWS CLI

kubectl

eksctl

4. Repository Structure

The relevant project structure is:

StreamingApp/
├── backend/
│   ├── authService/
│   ├── streamingService/
│   ├── adminService/
│   └── chatService/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── nginx.conf
│
├── streamingapp/
│   ├── Chart.yaml
│   ├── values.yaml
│   └── templates/
│       ├── auth-deployment.yaml
│       ├── auth-service.yaml
│       ├── streaming-deployment.yaml
│       ├── streaming-service.yaml
│       ├── admin-deployment.yaml
│       ├── admin-service.yaml
│       ├── chat-deployment.yaml
│       ├── chat-service.yaml
│       ├── frontend-deployment.yaml
│       ├── frontend-service.yaml
│       ├── mongo-statefulset.yaml
│       ├── mongo-service.yaml
│       ├── configmap.yaml
│       ├── secret.yaml
│       └── ingress.yaml
│
├── docker-compose.yml
├── Jenkinsfile
├── eks-cluster.yaml
├── .env.example
└── README.md

5. Containerization

Each application component was containerized separately.

The assignment requires five application images:

streaming-auth

streaming-stream

streaming-admin

streaming-chat

streaming-frontend

The frontend uses a multi-stage Docker build with Node.js for the React
build and Nginx for serving the resulting static application.

Example image naming convention:

zeeshan733/streaming-auth:1.0.0
zeeshan733/streaming-stream:1.0.0
zeeshan733/streaming-admin:1.0.0
zeeshan733/streaming-chat:1.0.0
zeeshan733/streaming-frontend:1.0.1

The frontend image was versioned to 1.0.1 during the final iteration.

Example build:

docker build -t zeeshan733/streaming-frontend:1.0.1 frontend

Example push:

docker push zeeshan733/streaming-frontend:1.0.1

6. Kubernetes Design

The application is modeled using the following Kubernetes resources.

Deployments

Separate Deployments are used for:

auth

streaming

admin

chat

frontend

Each Deployment includes:

replica configuration

rolling update strategy

container image

container port

environment configuration

readiness/liveness probes where applicable

CPU and memory resource requests/limits

The rolling update strategy was configured with:

rollingUpdate:
  maxUnavailable: 0
  maxSurge: 1

This supports a zero-unavailable rolling update approach.

7. Kubernetes Services

ClusterIP Services provide stable internal DNS names for
service-to-service communication.

The application uses services for:

auth
streaming
admin
chat
frontend
mongo

The backend services are not required to have individual public load
balancers because external application traffic is routed through the
Ingress.

8. Configuration

Non-secret application configuration is provided through a ConfigMap.

Examples include:

PORT
CLIENT_URLS
MONGO_URI / MongoDB host configuration
AWS_REGION
AWS_S3_BUCKET
AWS_CDN_URL
PUBLIC_URL

Sensitive values are handled through a Kubernetes Secret.

Examples include:

JWT_SECRET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY

Real credentials should never be committed to GitHub.

9. MongoDB

MongoDB is modeled as a Kubernetes StatefulSet with persistent storage.

Configuration includes:

image: mongo:6
storageSize: 5Gi

The database is exposed internally through the MongoDB service on:

27017

The intended Kubernetes DNS pattern is:

mongo.<namespace>.svc

This allows all application services to communicate with the shared
database using Kubernetes internal networking.

10. Helm

The Kubernetes resources are packaged as a Helm chart.

Chart structure:

streamingapp/
├── Chart.yaml
├── values.yaml
└── templates/

The values.yaml file controls configurable values such as:

image names

image tags

replica counts

service ports

resource requests

resource limits

MongoDB storage

AWS region

application configuration

Ingress hostname

rolling update parameters

Example:

services:
  auth:
    image: streaming-auth
    tag: "1.0.0"
    replicas: 2

  streaming:
    image: streaming-stream
    tag: "1.0.0"
    replicas: 2

  admin:
    image: streaming-admin
    tag: "1.0.0"
    replicas: 2

  chat:
    image: streaming-chat
    tag: "1.0.0"
    replicas: 1

  frontend:
    image: streaming-frontend
    tag: "1.0.1"
    replicas: 2

11. Helm Commands

Validate the chart:

helm lint ./streamingapp

Render the Kubernetes manifests without installing:

helm template streamingapp ./streamingapp

Install the application:

helm install streamingapp ./streamingapp

Check the Helm release:

helm list -A

Check release details:

helm status streamingapp

Upgrade the application:

helm upgrade streamingapp ./streamingapp

Example version update:

helm upgrade streamingapp ./streamingapp \
  --set services.frontend.tag=1.0.1

12. Amazon EKS

The application was prepared for deployment on an Amazon EKS cluster in
the AWS ap-south-1 region.

The Kubernetes context used during the deployment work was:

streamingapp-admin@streamingapp.ap-south-1.eksctl.io

The EKS cluster was provisioned with eksctl.

Basic cluster verification:

kubectl config current-context
kubectl get nodes

The cluster reached a healthy state with three worker nodes reporting
Ready.

13. Ingress

NGINX Ingress provides a single external entry point for the
application.

The intended routing is:

Path               Backend       Port

/                frontend        80
/api/auth        auth          3001
/api/streaming   streaming     3002
/api/admin       admin         3003
/api/chat        chat          3004
/ws              chat          3004
/socket.io       chat          3004

This provides one external application endpoint while keeping the
individual services internally accessible through Kubernetes Services.

Check the Ingress:

kubectl get ingress

Detailed information:

kubectl describe ingress

14. Scaling

Kubernetes Deployments were configured with multiple replicas for the
stateless services.

Example:

replicas: 2

Scaling can be demonstrated using:

kubectl scale deployment streaming --replicas=4

Verify:

kubectl get pods

The assignment also requires demonstrating safe rolling updates.

Example:

helm upgrade streamingapp ./streamingapp \
  --set services.auth.tag=1.0.1

Then:

kubectl rollout status deployment/auth

15. Health Checks

Readiness and liveness probes were configured for the application
containers.

Examples include:

Auth:
GET /health

Streaming:
GET /api/health

Frontend:
GET /

For services where HTTP health endpoints were not used, TCP socket
probes were configured.

The purpose of the probes is to prevent Kubernetes from sending traffic
to containers that are not ready and to allow Kubernetes to restart
unhealthy containers.

16. Monitoring and Logging

Amazon CloudWatch components were configured in the EKS environment.

The cluster included:

CloudWatch Agent

Fluent Bit

CloudWatch observability components

Kubernetes metrics server

Verify the monitoring namespace:

kubectl get pods -n amazon-cloudwatch

Application and container logs can be investigated through the
centralized logging configuration.

17. Verification Commands

Check all namespaces:

kubectl get namespaces

Check all pods:

kubectl get pods -A

Check deployments:

kubectl get deployments

Check services:

kubectl get svc

Check Ingress:

kubectl get ingress

Check pod details:

kubectl describe pod <pod-name>

View application logs:

kubectl logs <pod-name>

Check rollout:

kubectl rollout status deployment/<deployment-name>

18. End-to-End Testing

The intended final smoke-test sequence is:

1. Frontend

Open the application through the Ingress endpoint and verify that the
React frontend loads.

2. Registration

Create a new user account through the frontend.

3. Login

Sign in with the newly created account and verify that the backend
returns a valid authentication response/JWT.

4. Admin upload

Use the admin functionality to upload a video and thumbnail.

5. Streaming

Verify that the uploaded video appears in the catalogue and can be
played.

6. Chat

Open the application in two browser tabs and verify that messages sent
from one tab appear in the other.

7. Pod self-healing

Delete an application pod:

kubectl delete pod <pod-name>

Then verify that Kubernetes creates a replacement:

kubectl get pods

19. Current Validation Status

The infrastructure and deployment work was completed up to the available
AWS environment.

The following were completed during the project:

Docker containerization

Docker image creation

Docker image versioning

Docker Hub image publishing

Kubernetes cluster preparation

Amazon EKS cluster creation

Kubernetes manifests

Helm chart structure

ConfigMap and Secret configuration

MongoDB StatefulSet/PVC configuration

Kubernetes Services

NGINX Ingress configuration

Frontend deployment

Kubernetes replica configuration

Rolling update configuration

CloudWatch monitoring/logging components

Frontend accessibility through the Kubernetes environment

The frontend was successfully loaded in the browser.

Registration was also observed to complete successfully.

20. Known Limitation During Final Validation

The final authentication smoke test could not be completed successfully.

The browser showed:

An error occurred during login

The browser Network panel showed the login request and its preflight
request failing with a CORS-related error.

The observed browser state was:

login        CORS error
preflight    CORS error

Registration had already returned:

Registration successful. Please sign in.

Therefore, the remaining issue was isolated to the authentication/login
request path rather than the initial frontend rendering.

The likely area for further investigation is the relationship between:

Frontend
   |
   v
Ingress
   |
   v
Auth Service
   |
   v
CORS / CLIENT_URL configuration

The exact root cause was not fully verified before the AWS environment
became unavailable due to exhausted AWS account balance/credits.
Consequently, this README does not claim that the final login smoke
test passed.

21. Production Improvements

For a production deployment, the following improvements would be
appropriate:

Namespaces

Use a dedicated namespace rather than deploying application resources
into the default namespace.

TLS

Configure HTTPS using a certificate issued through cert-manager or an
AWS-managed certificate solution.

Secrets

Use AWS Secrets Manager, AWS Systems Manager Parameter Store, or another
secure secret-management solution instead of storing sensitive values
directly in Helm values.

Autoscaling

Configure Horizontal Pod Autoscalers for services whose workloads vary
significantly.

Database

Use MongoDB Atlas, Amazon DocumentDB, or another managed database
service instead of running MongoDB directly inside the application
cluster for a production environment.

Chat scaling

The chat service uses WebSockets/Socket.IO. Multiple replicas require an
appropriate shared adapter/message broker so that messages can be
synchronized across chat pods.

Image security

Use private registries, image scanning, signed images, and controlled
image pull credentials.

Resource management

Tune CPU/memory requests and limits based on real production workload
measurements.

High availability

Use multiple availability zones and appropriate Kubernetes node groups.

22. Troubleshooting

Helm lint fails

Run:

helm lint ./streamingapp

Then inspect the referenced template and compare it with values.yaml.

Pods are not starting

Run:

kubectl get pods
kubectl describe pod <pod-name>

Then check:

kubectl logs <pod-name>

Ingress returns 404

Check:

kubectl get ingress
kubectl describe ingress
kubectl get svc
kubectl get pods

Confirm that the Ingress backend service names and ports match the
Kubernetes Services.

Login returns a CORS error

Check:

Frontend URL
CLIENT_URLS
Ingress host
Auth service configuration
Ingress /api/auth routing

Then inspect the browser Network tab for both the preflight request and
the actual login request.

23. Assignment Deliverables

The project deliverables include:

GitHub repository

Dockerfiles

Docker images

Kubernetes manifests

Helm chart

Chart.yaml

values.yaml

Helm templates

Ingress configuration

CI/Jenkins configuration

Deployment documentation

Architecture documentation

Verification screenshots

Repository link submitted through the learning portal

24. Final Project Outcome

This project demonstrates an end-to-end container orchestration
workflow:

Application
    |
    v
Docker
    |
    v
Container Images
    |
    v
Docker Registry
    |
    v
Kubernetes
    |
    v
Helm
    |
    v
Amazon EKS
    |
    +---- Deployments
    +---- Services
    +---- ConfigMaps
    +---- Secrets
    +---- StatefulSet/PVC
    +---- Ingress
    |
    v
CloudWatch
    |
    v
Monitoring + Logging

The project provides practical experience with containerization,
Kubernetes orchestration, Helm-based deployment, Ingress routing,
rolling updates, scaling, health probes, persistent storage, and
AWS-based Kubernetes operations.
