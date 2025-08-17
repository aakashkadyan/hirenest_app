#!/bin/bash

echo "🚀 Setting up new AWS user for CI/CD..."

# Set variables
NEW_USER_NAME="hirenest-cicd-user"
POLICY_NAME="hirenest-cicd-policy"

echo "📋 Creating IAM Policy..."
aws iam create-policy \
  --policy-name $POLICY_NAME \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:PutImage",
          "ecr:CreateRepository"
        ],
        "Resource": "*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "ecs:DescribeTaskDefinition",
          "ecs:RegisterTaskDefinition",
          "ecs:UpdateService",
          "ecs:DescribeServices",
          "ecs:DescribeTasks",
          "ecs:ListTasks",
          "ecs:DescribeClusters",
          "ecs:DescribeContainerInstances"
        ],
        "Resource": "*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "iam:PassRole"
        ],
        "Resource": [
          "arn:aws:iam::*:role/ecsTaskExecutionRole",
          "arn:aws:iam::*:role/ecsTaskRole"
        ]
      }
    ]
  }' \
  --description "Policy for Hirenest CI/CD pipeline" \
  --output text

if [ $? -eq 0 ]; then
    echo "✅ Policy created successfully"
    
    # Get the policy ARN
    POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text)
    echo "📋 Policy ARN: $POLICY_ARN"
    
    echo "👤 Creating IAM User..."
    aws iam create-user --user-name $NEW_USER_NAME --output text
    
    if [ $? -eq 0 ]; then
        echo "✅ User created successfully"
        
        echo "🔑 Creating Access Keys..."
        aws iam create-access-key --user-name $NEW_USER_NAME --output json > access-keys.json
        
        if [ $? -eq 0 ]; then
            echo "✅ Access keys created successfully"
            
            echo "📎 Attaching Policy to User..."
            aws iam attach-user-policy --user-name $NEW_USER_NAME --policy-arn $POLICY_ARN
            
            if [ $? -eq 0 ]; then
                echo "✅ Policy attached successfully"
                
                echo ""
                echo "🎉 Setup Complete!"
                echo "=================="
                echo "Your new access keys:"
                cat access-keys.json | jq -r '.AccessKey | "AWS_ACCESS_KEY_ID: " + .AccessKeyId + "\nAWS_SECRET_ACCESS_KEY: " + .SecretAccessKey'
                
                echo ""
                echo "📋 Next Steps:"
                echo "1. Copy the access keys above"
                echo "2. Update your GitHub Secrets with these new keys"
                echo "3. Re-run the GitHub Actions workflow"
            else
                echo "❌ Failed to attach policy"
            fi
        else
            echo "❌ Failed to create access keys"
        fi
    else
        echo "❌ Failed to create user"
    fi
else
    echo "❌ Failed to create policy"
fi 