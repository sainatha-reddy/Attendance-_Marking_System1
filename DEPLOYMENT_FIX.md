# 🚨 Deployment Fix: 500 Internal Server Error

## The Problem

You're experiencing a **500 Internal Server Error** when clicking "Mark Attendance" on your hosted application. This happens because:

1. **Frontend** (deployed on Vercel) doesn't know where the **Backend** (deployed on Railway) is located
2. The `VITE_API_URL` environment variable is missing
3. Frontend tries to connect to `http://localhost:3001` (which doesn't exist in production)

## 🔧 The Solution

### Step 1: Get Your Railway Backend URL

1. Go to your [Railway Dashboard](https://railway.app/dashboard)
2. Find your attendance marking system project
3. Click on the backend service
4. Copy the **Domain URL** (it looks like: `https://your-app-name.railway.app`)

### Step 2: Set Environment Variable in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your attendance marking system project
3. Go to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-app-name.railway.app` (replace with your actual Railway URL)
   - **Environment**: Production (and Preview if you want)
5. Click **Save**
6. **Redeploy** your application

### Step 3: Verify the Fix

1. After redeployment, open your Vercel app
2. Open browser **Developer Tools** (F12)
3. Go to **Console** tab
4. Click "Mark Attendance"
5. You should see debug logs showing the correct API URL

## 🔍 Debugging Steps

### Check if Environment Variable is Set

In your browser console, you should see:
```javascript
API URL: https://your-app-name.railway.app
Environment: production
VITE_API_URL set: true
```

### If Still Getting Errors

1. **Check Railway Backend Status**:
   - Go to Railway dashboard
   - Ensure your backend service is running
   - Check the logs for any errors

2. **Test Backend Directly**:
   - Visit `https://your-app-name.railway.app/api/health`
   - Should return: `{"status":"Server is running",...}`

3. **Check CORS Configuration**:
   - Your backend should allow requests from your Vercel domain
   - Current CORS settings in `backend/server.js` include common Vercel domains

## 🛠️ Alternative Solutions

### Option 1: Update CORS in Backend

If you're still getting CORS errors, update your backend CORS configuration:

```javascript
// In backend/server.js, update the allowedOrigins array:
const allowedOrigins = [
  'https://your-vercel-app.vercel.app',  // Add your Vercel URL
  'https://attendance-marking-system-six.vercel.app',
  'https://attendance-marking-system-git-main-sainatha-reddys-projects.vercel.app',
  'https://attendance-marking-system-xi.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173'
];
```

### Option 2: Use a Single Deployment

Consider deploying both frontend and backend on the same platform:

1. **Railway**: Deploy both frontend and backend
2. **Vercel**: Use Vercel Functions for backend
3. **Render**: Deploy both frontend and backend

## 📋 Environment Variables Checklist

### For Vercel (Frontend):
- [ ] `VITE_API_URL` = `https://your-railway-app.railway.app`
- [ ] `VITE_FIREBASE_API_KEY` = Your Firebase API key
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` = Your Firebase auth domain
- [ ] `VITE_FIREBASE_PROJECT_ID` = Your Firebase project ID
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` = Your Firebase storage bucket
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` = Your Firebase sender ID
- [ ] `VITE_FIREBASE_APP_ID` = Your Firebase app ID

### For Railway (Backend):
- [ ] `NODE_ENV` = `production`
- [ ] `RAILWAY_ENVIRONMENT` = `production`
- [ ] `PYTHONPATH` = (Railway handles this automatically)

## 🚀 Quick Test

After setting the environment variable:

1. **Redeploy** your Vercel app
2. **Wait** for deployment to complete
3. **Test** the attendance marking feature
4. **Check** browser console for any remaining errors

## 📞 If Still Having Issues

1. **Check Railway Logs**: Look for Python script execution errors
2. **Check Vercel Logs**: Look for build or runtime errors
3. **Test Backend Health**: Visit your Railway URL + `/api/health`
4. **Verify Python Dependencies**: Ensure all Python packages are installed on Railway

## 🔗 Useful Links

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## 🚨 Important Notes

### Railway-Specific Considerations:

1. **Root Directory**: Your Railway deployment uses the `backend` folder as the root directory
2. **Python Dependencies**: Railway automatically installs Python packages from `requirements.txt`
3. **Port Configuration**: Railway automatically assigns a port, but your app listens on `process.env.PORT`
4. **Environment Variables**: Railway provides `RAILWAY_ENVIRONMENT` variable

### Backend Configuration:

Your `backend/server.js` already includes Railway-specific environment detection:
```javascript
const isCloudPlatform = process.env.RAILWAY_ENVIRONMENT || 
                        process.env.RENDER || 
                        process.env.HEROKU || 
                        process.env.VERCEL ||
                        process.env.NODE_ENV === 'production';
```

---

**Note**: The 500 error is almost certainly due to the missing `VITE_API_URL` environment variable. Setting this correctly should resolve the issue immediately. 