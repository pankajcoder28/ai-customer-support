# Render Deployment Guide

## Prerequisites

1. GitHub account with your code pushed
2. Render account (sign up at https://render.com)
3. MongoDB Atlas account (free tier available) or use Render's MongoDB add-on
4. OpenAI API key and Google OAuth credentials

## Step-by-Step Deployment

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: AI Customer Support App"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

### Step 2: Create Render Account

- Go to https://render.com
- Sign up and log in
- Connect your GitHub account

### Step 3: Deploy Using render.yaml (Recommended)

The `render.yaml` file in the root directory defines your entire infrastructure:

1. Go to your Render dashboard
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Choose the branch (main)
5. Click **"Apply"**
6. Render will automatically create:
   - Backend Web Service (Node.js)
   - Frontend Static Site (React)
   - MongoDB Database

### Step 4: Configure Environment Variables

After deployment, go to your Backend service settings and add these environment variables:

**Backend Environment Variables:**

- `NODE_ENV`: production
- `JWT_SECRET`: (generate a strong random string)
- `MONGODB_URI`: (from Render MongoDB or MongoDB Atlas)
- `OPENAI_API_KEY`: (your OpenAI key)
- `GOOGLE_CLIENT_ID`: (from Google Cloud Console)
- `GOOGLE_CLIENT_SECRET`: (from Google Cloud Console)
- `FRONTEND_URL`: (your frontend URL from Render)
- `ALLOWED_ORIGINS`: (your frontend URL)

**Frontend Environment Variables:**

- `VITE_API_URL`: https://your-backend-service.onrender.com

### Step 5: Set Up MongoDB

**Option A: Use Render's MongoDB Add-on**

1. In Blueprint, MongoDB is automatically created
2. Connection string is provided to backend

**Option B: Use MongoDB Atlas (Free)**

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Add to backend environment variable `MONGODB_URI`

### Step 6: Configure Google OAuth

1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Set Authorized redirect URI to:
   ```
   https://your-backend-service.onrender.com/api/auth/google/callback
   ```
4. Add credentials to Render environment variables

### Step 7: Update API Configuration in Frontend

Edit `Frontend/src/services/api.js` to use environment variable:

```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### Step 8: Verify Deployment

1. Visit your frontend URL
2. Test login/registration
3. Check console for API errors
4. Monitor backend logs in Render dashboard

## Manual Deployment (Without render.yaml)

If you prefer manual setup:

### Deploy Backend

1. Create new **Web Service**
2. Connect GitHub repo
3. Set runtime: **Node**
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables
7. Deploy

### Deploy Frontend

1. Create new **Static Site**
2. Connect GitHub repo
3. Build command: `cd Frontend && npm install && npm run build`
4. Publish directory: `Frontend/dist`
5. Add VITE_API_URL environment variable
6. Deploy

## Troubleshooting

### Backend won't start

- Check environment variables are set
- Verify MongoDB connection string
- Check logs in Render dashboard

### API calls fail from frontend

- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend's `ALLOWED_ORIGINS` includes frontend URL

### MongoDB connection issues

- Verify connection string is correct
- Ensure IP whitelist allows Render's IPs (if using Atlas)
- Check database user permissions

### Build failures

- Check Node version compatibility
- Verify package.json in both directories
- Check for missing dependencies

## Useful Render Dashboard Features

- **Logs**: Monitor real-time application logs
- **Metrics**: View CPU, memory, network usage
- **Sync with GitHub**: Auto-deploy on push (enable in settings)
- **Manual Deploy**: Redeploy anytime from dashboard

## Cost Considerations

- **Free tier**: Suitable for testing/development
- **Backend**: ~$7/month (paid tier after free credits)
- **Frontend**: ~$3/month (paid tier after free credits)
- **MongoDB**: Free tier available on Render

## Next Steps

After deployment:

1. Set up auto-deploy from GitHub (optional)
2. Configure custom domain
3. Set up monitoring/alerts
4. Monitor application performance
