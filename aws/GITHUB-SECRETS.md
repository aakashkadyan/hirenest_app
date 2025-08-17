# 🔐 GitHub Secrets Setup Guide

## Required Secrets for CI/CD Pipeline

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**

### 🔑 **AWS Credentials (Required)**
```
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

**Note**: These credentials are already in your `backend/.env` file and will be loaded automatically during the build process.

### 🌍 **AWS Configuration (Optional - will use defaults if not set)**
```
AWS_REGION=us-east-1
ECR_REPOSITORY_BACKEND=hirenest-backend
ECR_REPOSITORY_FRONTEND=hirenest-frontend
ECS_CLUSTER=hirenest-cluster
ECS_SERVICE_BACKEND=hirenest-backend-service
ECS_SERVICE_FRONTEND=hirenest-frontend-service
ECS_TASK_DEFINITION_BACKEND=hirenest-backend-task
ECS_TASK_DEFINITION_FRONTEND=hirenest-frontend-task
```

## How to Add Secrets

1. **Click "New repository secret"**
2. **Name**: `AWS_ACCESS_KEY_ID`
3. **Value**: `AKIAWI6F7HH2ZUWBZHCC`
4. **Click "Add secret"**
5. **Repeat for `AWS_SECRET_ACCESS_KEY`**

## Why These Secrets?

- **AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY**: Allow GitHub Actions to access your AWS account
- **Other variables**: Customize your deployment (optional)
- **Security**: Credentials are encrypted and never visible in logs

## Test Your Secrets

After adding secrets, push to main branch:
```bash
git add .
git commit -m "Setup CI/CD with environment variables"
git push origin main
```

The GitHub Actions will automatically use these secrets to deploy your app! 🚀 