#!/bin/bash

# Simple AWS Deployment Script for Hirenest
echo "🚀 Setting up Hirenest on AWS..."

# Load environment variables from backend .env file
echo "📋 Loading environment variables from backend .env..."
export $(cat ../backend/.env | grep -v '^#' | xargs)

# Set cluster name from environment
CLUSTER_NAME="$ECS_CLUSTER"

echo "📦 Creating ECR repositories..."
aws ecr create-repository --repository-name $ECR_REPOSITORY_BACKEND --region $AWS_REGION --output text
aws ecr create-repository --repository-name $ECR_REPOSITORY_FRONTEND --region $AWS_REGION --output text

echo "🏗️ Creating ECS cluster..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION --output text

echo "🔐 Creating IAM roles..."
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
}' --output text

aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

echo "📋 Registering task definitions..."
aws ecs register-task-definition --cli-input-json file://backend-task-definition.json --region $AWS_REGION --output text
aws ecs register-task-definition --cli-input-json file://frontend-task-definition.json --region $AWS_REGION --output text

echo "✅ Setup complete! Now:"
echo "1. Add all environment variables to GitHub secrets (see SETUP-CHECKLIST.md)"
echo "2. Push to main branch to trigger deployment"
echo "3. Create ECS services with your subnet and security group IDs" 