# StreamingApp on AWS EKS — Documentation

## Architecture
```mermaid
flowchart LR
  Dev[Developer] -->|git push| GH[GitHub fork]
  GH -->|webhook| J[Jenkins on EC2]
  J -->|docker build/push| ECR[(Amazon ECR<br/>5 repos)]
  subgraph EKS[EKS cluster - ap-south-1]
    ING[ingress-nginx<br/>AWS ELB] --> FE[frontend :80]
    ING -->|/api/auth| AU[auth :3001]
    ING -->|/api/streaming| ST[streaming :3002]
    ING -->|/api/admin| AD[admin :3003]
    ING -->|/api/chat, /socket.io| CH[chat :3004]
    AU & ST & AD & CH --> M[(MongoDB StatefulSet + EBS PVC)]
    CW[CloudWatch agent + Fluent Bit]
  end
  ECR -->|image pull| EKS
  CW --> CWL[CloudWatch Metrics, Logs, Alarms]
  User --> ING
```

## Deployment steps
See the numbered runbook commands (cluster: `eks-cluster.yaml`, CI: `Jenkinsfile`, chart: `streamingapp/`).
Fill in: commands run, screenshots, config notes, production-hardening paragraph (namespaces, TLS, HPA).
