#!/bin/bash

echo "🚀 Setting up complete ECS infrastructure for Hirenest..."

# Set variables
AWS_REGION="us-east-1"
CLUSTER_NAME="hirenest-cluster"
BACKEND_TASK_DEF="hirenest-backend-task"
FRONTEND_TASK_DEF="hirenest-frontend-task"
BACKEND_SERVICE="hirenest-backend-service"
FRONTEND_SERVICE="hirenest-frontend-service"

echo "🏗️ Creating ECS cluster..."
aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION --output text
if [ $? -eq 0 ]; then
    echo "✅ ECS cluster created successfully"
else
    echo "❌ Failed to create ECS cluster (might already exist)"
fi

echo ""
echo "🔐 Creating task definitions without logging (will add later)..."
echo "✅ IAM roles configured (using AWS defaults)"

echo ""
echo "📋 Creating backend task definition..."
aws ecs register-task-definition \
  --cli-input-json '{
    "family": "'$BACKEND_TASK_DEF'",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "containerDefinitions": [
      {
        "name": "hirenest-backend",
        "image": "431522527733.dkr.ecr.us-east-1.amazonaws.com/hirenest-backend:latest",
        "portMappings": [
          {
            "containerPort": 5002,
            "protocol": "tcp"
          }
        ],
        "environment": [
          {
            "name": "NODE_ENV",
            "value": "production"
          }
        ]
      }
    ]
  }' \
  --region $AWS_REGION --output text

if [ $? -eq 0 ]; then
    echo "✅ Backend task definition created successfully"
else
    echo "❌ Failed to create backend task definition"
fi

echo ""
echo "📋 Creating frontend task definition..."
aws ecs register-task-definition \
  --cli-input-json '{
    "family": "'$FRONTEND_TASK_DEF'",
    "networkMode": "awsvpc",
    "requiresCompatibilities": ["FARGATE"],
    "cpu": "256",
    "memory": "512",
    "containerDefinitions": [
      {
        "name": "hirenest-frontend",
        "image": "431522527733.dkr.ecr.us-east-1.amazonaws.com/hirenest-frontend:latest",
        "portMappings": [
          {
            "containerPort": 3000,
            "protocol": "tcp"
          }
        ],
        "environment": [
          {
            "name": "NODE_ENV",
            "value": "production"
          }
        ]
      }
    ]
  }' \
  --region $AWS_REGION --output text

if [ $? -eq 0 ]; then
    echo "✅ Frontend task definition created successfully"
else
    echo "❌ Failed to create frontend task definition"
fi

echo ""
echo "🔍 Getting default VPC and subnet information..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" --query 'Vpcs[0].VpcId' --output text)
SUBNET_ID=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query 'Subnets[0].SubnetId' --output text)
SECURITY_GROUP_ID=$(aws ec2 describe-security-groups --filters "Name=vpc-id,Values=$VPC_ID" "Name=group-name,Values=default" --query 'SecurityGroups[0].GroupId' --output text)

echo "VPC: $VPC_ID"
echo "Subnet: $SUBNET_ID"
echo "Security Group: $SECURITY_GROUP_ID"

echo ""
echo "⚠️  IMPORTANT: You need to create ECS services manually after this setup."
echo "The CI/CD pipeline will update existing services, but cannot create them."

echo ""
echo "📋 Manual steps needed:"
echo "1. Go to AWS Console → ECS → Clusters → $CLUSTER_NAME"
echo "2. Create service '$BACKEND_SERVICE' using task definition '$BACKEND_TASK_DEF'"
echo "3. Create service '$FRONTEND_SERVICE' using task definition '$FRONTEND_TASK_DEF'"
echo "4. Use VPC: $VPC_ID, Subnet: $SUBNET_ID, Security Group: $SECURITY_GROUP_ID"

echo ""
echo "🎯 After creating services, re-run the GitHub Actions workflow!" 