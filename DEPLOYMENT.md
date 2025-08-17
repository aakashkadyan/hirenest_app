# 🚀 Hirenest CI/CD Deployment Guide

## Overview
Your Hirenest app is now configured for **direct-to-production deployment** from the main branch using GitHub Actions and AWS ECS.

## What's Been Set Up

### 1. CI/CD Pipeline (`.github/workflows/deploy.yml`)
- ✅ Triggers on push to `main` branch only
- ✅ No staging environment - direct to production
- ✅ Builds production Docker images
- ✅ Pushes to AWS ECR
- ✅ Deploys to AWS ECS automatically

### 2. Production Dockerfiles
- ✅ `backend/Dockerfile.prod` - Optimized for production
- ✅ `frontend/Dockerfile.prod` - Uses Node.js serve for static files

### 3. AWS Infrastructure
- ✅ ECS Task Definitions ready
- ✅ Simple setup script (`aws/deploy.sh`)
- ✅ Step-by-step manual instructions

## Quick Start

### Step 1: Create AWS IAM User for CI/CD
```bash
cd aws
./create-cicd-user.sh
```
This will create a user with the exact permissions needed and show you the access keys.

### Step 2: Set up AWS Infrastructure
```bash
./deploy.sh
```

### Step 3: Add GitHub Secrets
Copy the access keys from Step 1 and add them to your GitHub repository:
- Go to: Settings → Secrets and variables → Actions
- Add: `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### Step 4: Deploy
```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

## How It Works

1. **Push to main** → Triggers GitHub Actions
2. **Build** → Creates production Docker images
3. **Push to ECR** → Uploads images to AWS
4. **Deploy to ECS** → Updates running services automatically

## Benefits

- 🚀 **Fast Deployments** - No manual steps needed
- 🔄 **Automatic Updates** - Every push to main deploys
- 🎯 **Production Ready** - Optimized Docker images
- 🛡️ **Reliable** - Uses AWS ECS for scalability
- 💰 **Cost Effective** - Fargate for serverless containers

## Next Steps

After running `deploy.sh`, you'll need to:
1. Create ECS services with your VPC subnet and security group IDs
2. Set up Application Load Balancer if needed
3. Configure custom domain and SSL certificate

## Support

The pipeline will automatically:
- Build your app
- Run basic tests
- Deploy to production
- Provide deployment status in GitHub Actions

**No more manual deployments!** 🎉 