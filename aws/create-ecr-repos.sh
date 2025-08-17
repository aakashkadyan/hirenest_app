#!/bin/bash

echo "🐳 Creating ECR Repositories for Hirenest..."

# Set your AWS region
AWS_REGION="us-east-1"

echo "📦 Creating backend repository..."
aws ecr create-repository \
  --repository-name hirenest-backend \
  --region $AWS_REGION \
  --output text

if [ $? -eq 0 ]; then
    echo "✅ Backend repository created successfully"
else
    echo "❌ Failed to create backend repository"
fi

echo ""
echo "📦 Creating frontend repository..."
aws ecr create-repository \
  --repository-name hirenest-frontend \
  --region $AWS_REGION \
  --output text

if [ $? -eq 0 ]; then
    echo "✅ Frontend repository created successfully"
else
    echo "❌ Failed to create frontend repository"
fi

echo ""
echo "🔍 Listing all ECR repositories..."
aws ecr describe-repositories --region $AWS_REGION --query 'repositories[*].[repositoryName,repositoryUri]' --output table

echo ""
echo "🎯 Next Steps:"
echo "1. After creating repositories, go back to GitHub Actions"
echo "2. Click 'Re-run jobs' on the failed workflow"
echo "3. The build and push should now work!" 