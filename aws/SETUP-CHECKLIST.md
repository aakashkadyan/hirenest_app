# 🔑 Complete CI/CD Setup Checklist

## Prerequisites ✅
- [ ] AWS CLI installed and configured
- [ ] Docker installed locally
- [ ] GitHub repository with your code
- [ ] AWS account with admin access

## Step 1: Create IAM User for CI/CD 🔐
```bash
cd aws
./create-cicd-user.sh
```
**What this does:**
- Creates IAM user `hirenest-cicd-user`
- Creates custom policy with exact permissions needed
- Generates access keys
- Shows you the keys to copy

**Required Permissions:**
- ECR (push/pull Docker images)
- ECS (deploy services)
- IAM (pass roles)
- CloudWatch Logs (application logs)

## Step 2: Set up AWS Infrastructure 🏗️
```bash
./deploy.sh
```
**What this does:**
- Creates ECR repositories for backend/frontend
- Creates ECS cluster
- Creates IAM roles for ECS tasks
- Registers task definitions

## Step 3: Add GitHub Secrets 🔒
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add these secrets:
   - `AWS_ACCESS_KEY_ID` = your actual access key
   - `AWS_SECRET_ACCESS_KEY` = your actual secret key
4. **Note**: These credentials are already in your `backend/.env` file
5. See `GITHUB-SECRETS.md` for detailed instructions

## Step 4: Create ECS Services (Manual) 🚀
After the setup scripts, you need to create ECS services:

```bash
# Get your subnet and security group IDs
aws ec2 describe-subnets --query 'Subnets[*].[SubnetId,AvailabilityZone]' --output table
aws ec2 describe-security-groups --query 'SecurityGroups[*].[GroupId,GroupName]' --output table

# Create backend service
aws ecs create-service \
  --cluster hirenest-cluster \
  --service-name hirenest-backend-service \
  --task-definition hirenest-backend-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-XXXXX],securityGroups=[sg-XXXXX],assignPublicIp=ENABLED}" \
  --region us-east-1

# Create frontend service
aws ecs create-service \
  --cluster hirenest-cluster \
  --service-name hirenest-frontend-service \
  --task-definition hirenest-frontend-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-XXXXX],securityGroups=[sg-XXXXX],assignPublicIp=ENABLED}" \
  --region us-east-1
```

## Step 5: Test the Pipeline 🧪
```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```

## What Happens Next 🔄
1. GitHub Actions automatically triggers
2. Builds production Docker images
3. Pushes to AWS ECR
4. Deploys to ECS services
5. Your app is live in production!

## Troubleshooting 🛠️
- **Permission Denied**: Check IAM user permissions
- **ECR Push Failed**: Verify access keys in GitHub secrets
- **ECS Deploy Failed**: Check task definition and service names
- **Service Unhealthy**: Check health check configuration

## Security Notes 🔒
- The IAM user has minimal required permissions
- Access keys are stored securely in GitHub secrets
- No hardcoded credentials in your code
- ECS tasks run with least privilege

## Cost Considerations 💰
- ECR: Pay per GB stored and transferred
- ECS Fargate: Pay per vCPU and memory used
- CloudWatch Logs: Pay per GB ingested
- Estimated: $10-50/month for small app 