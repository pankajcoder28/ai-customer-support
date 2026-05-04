# Quick Start: Deploy to Render in 5 Minutes

## 1. Push Your Code to GitHub

```bash
cd c:\Users\panka\OneDrive\Desktop\ai-cutomer\ai-customer-support-1

# Initialize git
git init
git add .
git commit -m "AI Customer Support App - Ready for Render"

# Create repo on GitHub, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-customer-support.git
git push -u origin main
```

## 2. Create Render Account & Deploy

1. Go to https://render.com
2. Click "Sign up with GitHub"
3. Authorize your GitHub account
4. Click **Blueprints** in the sidebar
5. Click **New +"** → **Blueprint**
6. Select your `ai-customer-support` repository
7. Select `main` branch
8. Click **Apply**

Render will now automatically:

- ✅ Build your backend
- ✅ Build your frontend
- ✅ Create MongoDB database
- ✅ Deploy everything

## 3. Add Environment Variables

After services are created (wait 2-3 minutes):

### For Backend Service:

Go to **Backend Service** → **Environment**

Add these variables:

```
JWT_SECRET = (any random strong string like: "your-super-secret-key-12345")
MONGODB_URI = (Render fills this automatically)
OPENAI_API_KEY = your_openai_key_here
GOOGLE_CLIENT_ID = your_google_client_id_here
GOOGLE_CLIENT_SECRET = your_google_client_secret_here
FRONTEND_URL = https://your-frontend-service.onrender.com
ALLOWED_ORIGINS = https://your-frontend-service.onrender.com
```

### For Frontend Service:

Go to **Frontend Service** → **Environment**

Add this variable:

```
VITE_API_URL = https://your-backend-service.onrender.com
```

## 4. Update Google OAuth

1. Go to Google Cloud Console
2. Find your OAuth credentials
3. Add this redirect URI:
   ```
   https://your-backend-service.onrender.com/api/auth/google/callback
   ```

## 5. Test Your Deployment

1. Visit your frontend URL (from Render dashboard)
2. Try to register/login
3. Check if it works! 🎉

---

## Getting Environment Variable Values

### OPENAI_API_KEY

- Visit: https://platform.openai.com/api-keys
- Create new key
- Copy and paste

### GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET

- Visit: https://console.cloud.google.com
- Create new OAuth 2.0 credentials
- Type: Web application
- Authorized redirect URIs: `https://your-backend.onrender.com/api/auth/google/callback`
- Copy credentials

### JWT_SECRET

- Generate any random string (minimum 20 characters recommended)
- Example: `SuPeRsEcReT123!@#key`

---

## Service URLs After Deployment

You'll find these in your Render dashboard:

- **Frontend**: `https://ai-customer-support-frontend.onrender.com`
- **Backend**: `https://ai-customer-support-backend.onrender.com`
- **MongoDB**: (connection string in backend environment variables)

---

## Auto-Redeploy on GitHub Push

Your app will automatically redeploy when you push to GitHub! Just:

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main
# Render automatically rebuilds and deploys within 1-2 minutes
```

---

## Troubleshooting

**Blank page or 404?**

- Wait 5 minutes for deployment to complete
- Refresh the page
- Check Render dashboard for build errors

**API calls failing?**

- Check frontend URL in browser (must match VITE_API_URL)
- Check Render logs: Backend service → Logs
- Verify all environment variables are set

**Database not connecting?**

- Check MONGODB_URI in backend environment
- For MongoDB Atlas: verify IP whitelist

**Still stuck?**

- Check the detailed guide: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
- Check deployment checklist: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
