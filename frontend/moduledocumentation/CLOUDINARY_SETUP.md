# Heritage Module - Photo Upload Setup

## Cloudinary Configuration

The Heritage module uses Cloudinary for image uploads. To enable photo uploads:

### 1. Create a Cloudinary Account
- Go to https://cloudinary.com/
- Sign up for a free account

### 2. Get Your Credentials
- After login, go to Dashboard
- Note your **Cloud Name**
- Create an **Upload Preset**:
  - Go to Settings → Upload
  - Scroll to "Upload presets"
  - Click "Add upload preset"
  - Name it: `tripora_heritage`
  - Set Signing Mode to: **Unsigned**
  - Save

### 3. Update HeritageCreate.jsx
Replace these lines in `/frontend/src/pages/HeritageCreate.jsx`:

```javascript
// Line 73-74
formData.append('upload_preset', 'tripora_heritage');
formData.append('cloud_name', 'YOUR_CLOUD_NAME_HERE'); // Replace with your cloud name

// Line 78
'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME_HERE/image/upload', // Replace with your cloud name
```

### Alternative: Use Direct URLs
If you don't want to set up Cloudinary immediately, you can:
1. Upload images to any image hosting service (Imgur, etc.)
2. Copy the direct image URLs
3. Paste them in the photo URL fields

The form will work with direct URLs without Cloudinary setup.
