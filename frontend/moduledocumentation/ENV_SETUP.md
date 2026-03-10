# Environment Variables Setup

## Frontend Configuration

The frontend uses environment variables to store sensitive credentials and configuration.

### Setup Steps

1. **Copy the example file:**
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Configure Cloudinary:**
   - Sign up at [Cloudinary](https://cloudinary.com) (free tier available)
   - Go to your [Cloudinary Console](https://cloudinary.com/console)
   - Copy your **Cloud Name** from the dashboard
   - Create an upload preset:
     - Go to Settings → Upload → Upload presets
     - Click "Add upload preset"
     - Set preset name: `tripora_heritage`
     - Set signing mode: **Unsigned**
     - Save

3. **Update `.env` file:**
   ```env
   VITE_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=tripora_heritage
   VITE_API_BASE_URL=http://localhost:8000
   ```

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | `dxyz123abc` |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Upload preset name | `tripora_heritage` |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |

### Important Notes

- **Never commit `.env`** - It's already in `.gitignore`
- Use `.env.example` as a template for other developers
- All Vite env variables must start with `VITE_` prefix
- Access in code: `import.meta.env.VITE_VARIABLE_NAME`
- Changes require dev server restart

### Troubleshooting

**Images not uploading?**
- Verify cloud name is correct
- Check upload preset exists and is unsigned
- Open browser console for detailed errors

**API not connecting?**
- Verify backend is running on port 8000
- Check `VITE_API_BASE_URL` matches backend URL
