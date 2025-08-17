#!/bin/bash

# Create IAM User and Policy for CI/CD
echo "🔐 Creating IAM User and Policy for CI/CD..."

# Set variables
USER_NAME="hirenest-cicd-user"
POLICY_NAME="hirenest-cicd-policy"

echo "📋 Creating IAM Policy..."
aws iam create-policy \
  --policy-name $POLICY_NAME \
  --policy-document file://iam-policy.json \
  --description "Policy for Hirenest CI/CD pipeline" \
  --output text

# Get the policy ARN
POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text)

echo "👤 Creating IAM User..."
aws iam create-user --user-name $USER_NAME --output text

echo "🔑 Creating Access Keys..."
aws iam create-access-key --user-name $USER_NAME --output json > access-keys.json

echo "📎 Attaching Policy to User..."
aws iam attach-user-policy --user-name $USER_NAME --policy-arn $POLICY_ARN

echo "✅ Setup Complete!"
echo ""
echo "🔑 Your Access Keys (save these securely):"
echo "=========================================="
cat access-keys.json | jq -r '.AccessKey | "AWS_ACCESS_KEY_ID: " + .AccessKeyId + "\nAWS_SECRET_ACCESS_KEY: " + .SecretAccessKey'

echo ""
echo "📋 Next Steps:"
echo "1. Copy the access keys above"
echo "2. Add them to GitHub Secrets:"
echo "   - Go to your GitHub repo → Settings → Secrets and variables → Actions"
echo "   - Add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
echo "3. Run: cd aws && ./deploy.sh"
echo "4. Push to main branch to trigger deployment" 