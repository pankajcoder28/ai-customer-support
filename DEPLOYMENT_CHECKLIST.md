# Render Deployment Checklist

## Pre-Deployment Tasks

- [ ] Create GitHub account if you don't have one
- [ ] Create Render account at https://render.com
- [ ] Create MongoDB Atlas account or plan to use Render's MongoDB
- [ ] Obtain OpenAI API key from https://platform.openai.com
- [ ] Set up Google OAuth credentials from Google Cloud Console

## GitHub Setup

- [ ] Initialize git: `git init`
- [ ] Add all files: `git add .`
- [ ] Commit: `git commit -m "Initial commit"`
- [ ] Create repository on GitHub
- [ ] Push code: `git push -u origin main`
- [ ] Verify code is on GitHub

## Render Deployment

- [ ] Log in to Render dashboard
- [ ] Go to **Blueprints** (or create individual services)
- [ ] Click **New +** → **Blueprint**
- [ ] Connect and authorize GitHub
- [ ] Select your repository
- [ ] Select `main` branch
- [ ] Click **Apply**
- [ ] Wait for services to build and deploy

## Environment Variables Setup

After services are created, add these to your Backend service:

- [ ] `NODE_ENV` = `production`
- [ ] `JWT_SECRET` = (generate strong random string)
- [ ] `MONGODB_URI` = (from Render or MongoDB Atlas)
- [ ] `OPENAI_API_KEY` = (your OpenAI API key)
- [ ] `GOOGLE_CLIENT_ID` = (from Google Cloud Console)
- [ ] `GOOGLE_CLIENT_SECRET` = (from Google Cloud Console)
- [ ] `FRONTEND_URL` = (your Render frontend URL)
- [ ] `ALLOWED_ORIGINS` = (your frontend URL)

Add to Frontend service:

- [ ] `VITE_API_URL` = `https://your-backend-url.onrender.com`

## Google OAuth Configuration

- [ ] Go to Google Cloud Console
- [ ] Add authorized redirect URI:
  ```
  https://your-backend-service.onrender.com/api/auth/google/callback
  ```
- [ ] Update Render environment variables with credentials

## MongoDB Setup

### Option A: Render's Built-in MongoDB (Recommended for quick setup)

- [ ] MongoDB is automatically created with blueprint
- [ ] Connection string is in Backend's environment variables

### Option B: MongoDB Atlas

- [ ] Create free cluster on MongoDB Atlas
- [ ] Create database user
- [ ] Get connection string
- [ ] Add to `MONGODB_URI` in Render
- [ ] Whitelist Render's IP (if required by Atlas)

## Testing & Verification

- [ ] Frontend page loads: `https://your-frontend.onrender.com`
- [ ] Navigate to login page
- [ ] Verify API calls in browser console (should see requests to backend)
- [ ] Test user registration
- [ ] Test user login
- [ ] Check Render dashboard logs for errors
- [ ] Verify MongoDB has data

## Troubleshooting

### Services stuck in building/deploying

- Check Render dashboard logs
- Verify environment variables are set
- Ensure all required variables are present

### API calls fail (CORS errors)

- Verify `ALLOWED_ORIGINS` includes frontend URL
- Check backend logs for CORS errors
- Ensure backend service is running

### Database connection fails

- Verify `MONGODB_URI` is correct
- Check MongoDB user permissions
- For Atlas: verify IP whitelist
- Check connection string format

### Frontend shows blank page or 404

- Verify `VITE_API_URL` is set correctly
- Check that build command ran successfully
- Verify dist folder was built

## Post-Deployment

- [ ] Set up auto-deploy from GitHub (optional)
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and alerts
- [ ] Test all features thoroughly
- [ ] Document any issues found

## Useful Commands

**Push changes after deployment:**

```bash
git add .
git commit -m "Your message"
git push origin main
# Render will auto-redeploy
```

**View logs:**

- Open Render dashboard → Select service → Logs tab

**Rollback deployment:**

- Render dashboard → Deployments → Select previous → Click Rollback
