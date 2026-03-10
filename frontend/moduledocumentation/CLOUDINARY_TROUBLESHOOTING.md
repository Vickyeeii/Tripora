# Cloudinary Troubleshooting Guide

## Common Issues and Solutions

### 1. 401 Unauthorized Error

**Error**: `Failed to load resource: the server responded with a status of 401 (Unauthorized)`

**Cause**: Incorrect cloud name or upload preset configuration

**Solution**:
1. Open `frontend/.env`
2. Verify `VITE_CLOUDINARY_CLOUD_NAME` is your actual cloud name (NOT "tripora_heritage")
3. Find your cloud name:
   - Login to [Cloudinary Console](https://cloudinary.com/console)
   - Look for "Product Environment Credentials"
   - Copy the "Cloud name" (e.g., `dxyz123abc`)
4. Update `.env`:
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=dxyz123abc
   ```
5. Restart dev server: `npm run dev`

### 2. Upload Preset Not Found

**Error**: Upload preset does not exist

**Solution**:
1. Go to [Cloudinary Settings](https://cloudinary.com/console/settings/upload)
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Set:
   - Preset name: `tripora_heritage`
   - Signing mode: **Unsigned** (important!)
5. Save

### 3. Images Not Displaying After Creation

**Cause**: Cloudinary upload failed but heritage site was created

**Current Behavior**: Site is created without photos, shows placeholder

**Solution**: The app now creates the site first, then uploads photos. If upload fails, the site still exists and you can:
- Edit the site to add photos later
- Check browser console for specific upload errors
- Verify Cloudinary credentials

### 4. Environment Variables Not Loading

**Symptoms**: `undefined` in Cloudinary URL

**Solution**:
1. Ensure `.env` file is in `frontend/` directory (not root)
2. All variables must start with `VITE_` prefix
3. Restart dev server after changing `.env`
4. Check variables are loaded:
   ```javascript
   console.log(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
   ```

### 5. Testing Without Cloudinary

If you want to test without setting up Cloudinary:

1. Skip photo upload during heritage creation
2. Site will be created with placeholder images
3. You can add photos later using direct URLs from other image hosts

### Quick Verification Checklist

- [ ] `.env` file exists in `frontend/` directory
- [ ] Cloud name is correct (not the upload preset name)
- [ ] Upload preset exists and is set to "Unsigned"
- [ ] Dev server restarted after `.env` changes
- [ ] Browser console shows no CORS errors
- [ ] Cloudinary account is active (free tier is fine)

### Still Having Issues?

1. Check browser console for detailed error messages
2. Verify network tab shows correct Cloudinary URL
3. Test upload directly on Cloudinary dashboard
4. Ensure file size is under Cloudinary limits (10MB for free tier)
