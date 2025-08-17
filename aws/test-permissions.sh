#!/bin/bash

echo "🔍 Testing AWS Permissions Step by Step..."
echo "=========================================="

echo "1. Testing basic AWS authentication..."
aws sts get-caller-identity
if [ $? -eq 0 ]; then
    echo "✅ Authentication successful"
else
    echo "❌ Authentication failed"
    exit 1
fi

echo ""
echo "2. Testing ECR access..."
aws ecr get-authorization-token --region us-east-1
if [ $? -eq 0 ]; then
    echo "✅ ECR access successful"
else
    echo "❌ ECR access failed - check permissions"
fi

echo ""
echo "3. Testing ECS access..."
aws ecs list-clusters --region us-east-1
if [ $? -eq 0 ]; then
    echo "✅ ECS access successful"
else
    echo "❌ ECS access failed - check permissions"
fi

echo ""
echo "4. Testing IAM access..."
aws iam list-roles --max-items 1
if [ $? -eq 0 ]; then
    echo "✅ IAM access successful"
else
    echo "❌ IAM access failed - check permissions"
fi

echo ""
echo "🔍 Permission test complete!"
echo "If any step failed, that's where the issue is." 