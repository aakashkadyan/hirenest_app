const AWS = require('aws-sdk');
require('dotenv').config();

// Validate required environment variables
const validateEnvVars = () => {
  const requiredVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('\n🚨 AWS S3 CONFIGURATION ERROR:');
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Validate environment variables on startup (but don't crash the app)
let awsConfigured = false;
try {
  validateEnvVars();
  awsConfigured = true;
} catch (error) {
  console.warn('⚠️ AWS S3 not configured - resume uploads will be skipped');
  console.warn('To enable AWS S3, set the required environment variables');
}

// Configure AWS (only if credentials are available)
let s3 = null;
let bucketName = null;

if (awsConfigured) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });

  s3 = new AWS.S3();
  bucketName = process.env.AWS_S3_BUCKET_NAME;
  console.log('✅ AWS S3 configured successfully');
} else {
  console.log('ℹ️ AWS S3 not configured - resume uploads will be skipped');
}

// Function to upload file to AWS S3 with proper error handling
const uploadToS3 = async (file) => {
  // If S3 is not configured, return null (skip upload)
  if (!awsConfigured || !s3 || !bucketName) {
    console.log('📤 S3 not configured - skipping resume upload');
    console.log('📄 File name:', file.originalname);
    return null;
  }

  try {
    console.log('📤 Starting AWS S3 upload...');
    console.log('📄 File name:', file.originalname);
    console.log('📁 Bucket name:', bucketName);

    // Validate file type - only allow PDF files
    if (file.mimetype !== 'application/pdf') {
      throw new Error('Only PDF files are allowed for resumes');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Generate file key using original filename with timestamp for uniqueness
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
    const fileKey = `resumes/${timestamp}_${originalName}`;

    const params = {
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: 'application/pdf',
      ContentDisposition: `inline; filename="resume.pdf"`,
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
        fileSize: file.size.toString(),
        type: 'resume'
      }
    };

    console.log('Uploading file to S3...');
    
    const result = await s3.upload(params).promise();

    console.log('✅ Resume uploaded successfully to S3!');
    console.log('📁 File Key:', result.Key);
    console.log('🔗 URL:', result.Location);

    return {
      fileId: result.Key,
      fileName: file.originalname,
      webViewLink: result.Location,
      source: 'aws_s3',
      bucket: bucketName,
      etag: result.ETag
    };

  } catch (error) {
    console.error('❌ S3 upload failed:', error.message);
    throw new Error(`Failed to upload resume to S3: ${error.message}`);
  }
};

// Function to delete file from S3
const deleteFromS3 = async (fileId) => {
  try {
    console.log('🗑️ Deleting from S3:', fileId);
    
    const params = {
      Bucket: bucketName,
      Key: fileId
    };

    await s3.deleteObject(params).promise();
    console.log('✅ Resume deleted from S3 successfully');
  } catch (error) {
    console.error('❌ Error deleting resume from S3:', error);
    throw error;
  }
};

// Function to get signed URL for private files (if needed)
const getSignedUrl = async (fileKey, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileKey,
      Expires: expiresIn
    };

    const signedUrl = await s3.getSignedUrlPromise('getObject', params);
    return signedUrl;
  } catch (error) {
    console.error('❌ Error generating signed URL:', error);
    throw error;
  }
};

// Function to check if file exists in S3
const fileExists = async (fileKey) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: fileKey
    };

    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  getSignedUrl,
  fileExists
}; 