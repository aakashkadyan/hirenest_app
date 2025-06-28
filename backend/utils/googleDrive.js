const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Validate required environment variables
const validateEnvVars = () => {
  const requiredVars = [
    'GOOGLE_DRIVE_CLIENT_EMAIL',
    'GOOGLE_DRIVE_PRIVATE_KEY',
    'GOOGLE_DRIVE_FOLDER_ID'
  ];
  
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('\n🚨 GOOGLE DRIVE CONFIGURATION ERROR:');
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Validate environment variables
validateEnvVars();

// Clean and format the private key properly
let privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
if (privateKey.includes('\\n')) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

console.log('✅ Google Drive API configured successfully');

// Function to upload file to Google Drive with proper error handling
const uploadToGoogleDrive = async (file) => {
  try {
    console.log('📤 Starting Google Drive upload...');
    console.log('📄 File name:', file.originalname);
    console.log('📁 Folder ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);

    // Create service account credentials
    const credentials = {
      type: 'service_account',
      project_id: 'hirenest-463118',
      private_key_id: '32a67afdce8538fa3857e5d90fba2055427848aa',
      private_key: privateKey,
      client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
      client_id: '113603911927525778054',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_DRIVE_CLIENT_EMAIL)}`
    };

    // Try Google Drive upload first
    try {
      console.log('🔐 Authenticating with Google Drive...');
      
      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });

      const authClient = await auth.getClient();
      console.log('✅ Authentication successful with user:', credentials.client_email);
      
      const drive = google.drive({ version: 'v3', auth: authClient });

      const fileMetadata = {
        name: file.originalname,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      };

      const media = {
        mimeType: file.mimetype,
        body: require('stream').Readable.from(file.buffer)
      };

      console.log('📤 Uploading file to Google Drive...');
      
      const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,webViewLink'
      });

      console.log('✅ File uploaded successfully to Google Drive!');
      console.log('📁 File ID:', response.data.id);
      console.log('🔗 View Link:', response.data.webViewLink);

      // Also save locally as backup
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const localFilePath = path.join(uploadDir, `${response.data.id}_${file.originalname}`);
      fs.writeFileSync(localFilePath, file.buffer);
      console.log('💾 File also saved locally as backup:', localFilePath);

      return {
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        localPath: localFilePath,
        source: 'google_drive'
      };

    } catch (driveError) {
      console.error('❌ Google Drive upload failed:', driveError.message);
      
      // Fallback to local storage
      console.log('🔄 Falling back to local storage...');
      
      const mockFileId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const uploadDir = path.join(__dirname, '../uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const localFilePath = path.join(uploadDir, `${mockFileId}_${file.originalname}`);
      fs.writeFileSync(localFilePath, file.buffer);
      
      console.log('💾 File saved locally:', localFilePath);
      
      // Create a local file URL that can be served by your backend
      const localViewLink = `${process.env.BASE_URL || 'http://localhost:5002'}/uploads/${mockFileId}_${file.originalname}`;
      
      return {
        fileId: mockFileId,
        fileName: file.originalname,
        webViewLink: localViewLink,
        localPath: localFilePath,
        source: 'local_storage'
      };
    }

  } catch (error) {
    console.error('❌ Upload process failed completely:', error);
    throw new Error(`Failed to upload resume: ${error.message}`);
  }
};

// Function to delete file from Google Drive or local storage
const deleteFromGoogleDrive = async (fileId) => {
  try {
    if (fileId.startsWith('local_')) {
      // Delete local file
      console.log('🗑️ Deleting local file:', fileId);
      
      const uploadDir = path.join(__dirname, '../uploads');
      const files = fs.readdirSync(uploadDir);
      const fileToDelete = files.find(f => f.startsWith(fileId));
      
      if (fileToDelete) {
        fs.unlinkSync(path.join(uploadDir, fileToDelete));
        console.log('✅ Local file deleted successfully');
      }
    } else {
      // Delete from Google Drive
      console.log('🗑️ Deleting from Google Drive:', fileId);
      
      const credentials = {
        type: 'service_account',
        project_id: 'hirenest-463118',
        private_key_id: '32a67afdce8538fa3857e5d90fba2055427848aa',
        private_key: privateKey,
        client_email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
        client_id: '113603911927525778054',
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_DRIVE_CLIENT_EMAIL)}`
      };

      const auth = new google.auth.GoogleAuth({
        credentials: credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file']
      });

      const authClient = await auth.getClient();
      const drive = google.drive({ version: 'v3', auth: authClient });

      await drive.files.delete({ fileId: fileId });
      console.log('✅ File deleted from Google Drive successfully');
      
      // Also try to delete local backup
      const uploadDir = path.join(__dirname, '../uploads');
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        const backupFile = files.find(f => f.startsWith(fileId));
        if (backupFile) {
          fs.unlinkSync(path.join(uploadDir, backupFile));
          console.log('✅ Local backup also deleted');
        }
      }
    }
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
};

module.exports = {
  uploadToGoogleDrive,
  deleteFromGoogleDrive,
}; 