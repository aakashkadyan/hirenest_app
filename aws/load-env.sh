#!/bin/bash

# Load environment variables from config file
if [ -f "config.env" ]; then
    echo "📋 Loading environment variables from config.env..."
    export $(cat config.env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded successfully!"
else
    echo "❌ config.env file not found!"
    echo "Please create config.env with your AWS credentials"
    exit 1
fi

# Verify required variables
required_vars=("AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY" "AWS_REGION")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done

echo "🔑 AWS Access Key ID: ${AWS_ACCESS_KEY_ID:0:8}..."
echo "🌍 AWS Region: $AWS_REGION"
echo "✅ All required variables are set!" 