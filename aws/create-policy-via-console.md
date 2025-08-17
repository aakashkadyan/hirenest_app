# 🔐 Add AWS Permissions via Console

## Since your user doesn't have IAM admin privileges, use the AWS Console:

### **Step 1: Go to AWS Console**
- Open: https://console.aws.amazon.com/
- Sign in with your `aakashk` user

### **Step 2: Navigate to IAM**
- Search for "IAM" in the services
- Click on "IAM" (Identity and Access Management)

### **Step 3: Find Your User**
- Click "Users" in the left sidebar
- Click on your username: `aakashk`

### **Step 4: Add Permissions**
- Click "Add permissions" button
- Choose "Attach policies directly"
- Search for and select these policies:

#### **Required Policies:**
1. **`AmazonEC2ContainerRegistryFullAccess`**
   - Allows full access to ECR (push/pull Docker images)

2. **`AmazonECSFullAccess`**
   - Allows full access to ECS (deploy services)

3. **`IAMReadOnlyAccess`**
   - Allows reading IAM roles (needed for ECS)

### **Step 5: Review and Create**
- Click "Next: Review"
- Click "Add permissions"

### **Step 6: Test the Permissions**
After adding permissions, go back to GitHub Actions and click "Re-run jobs"

## **Alternative: Use Admin Account**
If you have access to an admin account, you can run the CLI command:
```bash
aws iam put-user-policy --user-name aakashk --policy-name hirenest-deploy-policy --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["ecr:GetAuthorizationToken","ecr:BatchCheckLayerAvailability","ecr:GetDownloadUrlForLayer","ecr:BatchGetImage","ecr:InitiateLayerUpload","ecr:UploadLayerPart","ecr:CompleteLayerUpload","ecr:PutImage","ecr:CreateRepository","ecs:DescribeTaskDefinition","ecs:RegisterTaskDefinition","ecs:UpdateService","ecs:DescribeServices","ecs:DescribeTasks","ecs:ListTasks","ecs:DescribeClusters","ecs:DescribeContainerInstances","iam:PassRole"],"Resource":"*"}]}'
``` 