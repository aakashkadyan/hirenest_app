#!/bin/bash

echo "🔧 Fixing ECS Service-Linked Role Issue..."

# Set variables
AWS_REGION="us-east-1"

echo "📋 Creating ECS service-linked role..."
aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com --output text

if [ $? -eq 0 ]; then
    echo "✅ ECS service-linked role created successfully"
else
    echo "⚠️  Role might already exist, continuing..."
fi

echo ""
echo "🔍 Verifying the role exists..."
aws iam get-role --role-name AWSServiceRoleForECS --output text 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ ECS service-linked role verified"
else
    echo "❌ ECS service-linked role still not accessible"
    echo "You may need to wait a few minutes for the role to propagate"
fi

echo ""
echo "🎯 Now try creating the ECS cluster again:"
echo "1. Go to AWS Console → ECS → Clusters"
echo "2. Click 'Create cluster'"
echo "3. Use name: hirenest-cluster"
echo "4. Choose 'Networking only' (Fargate)"
echo "5. Click 'Create'"
echo ""
echo "After the cluster is created, run: ./setup-ecs-infrastructure.sh" 