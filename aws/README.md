# AWS Setup for Hirenest App - Direct to Production

## Prerequisites
- AWS CLI installed and configured
- Docker installed locally
- GitHub repository with your code

## Quick Setup (One Command)
```bash
cd aws
./deploy.sh
```

## Manual Setup Steps

### 1. Create ECR Repositories
```bash
aws ecr create-repository --repository-name hirenest-backend --region us-east-1
aws ecr create-repository --repository-name hirenest-frontend --region us-east-1
```

### 2. Create ECS Cluster
```bash
aws ecs create-cluster --cluster-name hirenest-cluster --region us-east-1
```

### 3. Create IAM Roles
```bash
# Create execution role
aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}'

# Attach policy
aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

### 4. Create Task Definitions
```bash
# Register backend task definition
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json --region us-east-1

# Register frontend task definition  
aws ecs register-task-definition --cli-input-json file://frontend-task-definition.json --region us-east-1
```

### 5. Create ECS Services
```bash
# Create backend service
aws ecs create-service \
  --cluster hirenest-cluster \
  --service-name hirenest-backend-service \
  --task-definition hirenest-backend-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
  --region us-east-1

# Create frontend service
aws ecs create-service \
  --cluster hirenest-cluster \
  --service-name hirenest-frontend-service \
  --task-definition hirenest-frontend-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}" \
  --region us-east-1
```

## GitHub Secrets Required
Add these secrets to your GitHub repository:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## Notes
- The CI/CD pipeline will automatically build and deploy on every push to main branch
- No staging environment - direct deployment to production
- After running deploy.sh, you'll need to create ECS services with your subnet and security group IDs
- The task definitions are now simplified and ready to use 