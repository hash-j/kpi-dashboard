# 🚀 KPI Dashboard Deployment Guide

## **Architecture**
```
Vercel Frontend → Render Backend API → Neon PostgreSQL
```

---

## **📋 PRE-DEPLOYMENT CHECKLIST**

### ✅ What We've Already Done:
1. ✓ Updated `.env` file (NODE_ENV=production)
2. ✓ Enhanced CORS configuration in `server.js`
3. ✓ Created `Procfile` for Render
4. ✓ Created `.env.production` for frontend
5. ✓ Created `.env.development` for local testing

### ⚠️ Before Starting Deployment:

**You need to provide:**
1. **Your Vercel Frontend URL** - After first deployment, it will be like: `https://your-project.vercel.app`
2. **Your Render Backend URL** - After deployment, it will be like: `https://your-backend.onrender.com`

---

## **🔧 DEPLOYMENT PHASE 1: DEPLOY BACKEND (Render)**

### **Step 1: Push Code to GitHub**
```bash
cd e:\kpi-dashboard

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Prepare for production deployment"

# Create a new repository on GitHub named: kpi-dashboard

# Push to GitHub (replace with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/kpi-dashboard.git
git branch -M main
git push -u origin main
```

### **Step 2: Deploy Backend on Render**
1. Go to https://render.com and log in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository (kpi-dashboard)
4. Fill in the form:
   - **Name**: `kpi-dashboard-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Production

5. **Add Environment Variables** in Render dashboard:
   - `PORT`: `5000`
   - `NEON_DATABASE_URL`: (Copy from your local .env)
   - `JWT_SECRET`: (Copy from your local .env)
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: (Your Vercel URL - we'll update this later)

6. Click "Deploy" and wait for the build to complete

### **Step 3: Get Your Backend URL**
Once deployed, Render will give you a URL like:
```
https://kpi-dashboard-backend.onrender.com
```
**Save this URL!** You'll need it for the frontend.

---

## **🎨 DEPLOYMENT PHASE 2: DEPLOY FRONTEND (Vercel)**

### **Step 1: Update Frontend Environment**
After getting your Render backend URL, update `.env.production`:
```
REACT_APP_API_URL=https://kpi-dashboard-backend.onrender.com/api
```

### **Step 2: Push Changes to GitHub**
```bash
cd e:\kpi-dashboard
git add frontend/.env.production
git commit -m "Update backend URL for production"
git push origin main
```

### **Step 3: Deploy Frontend on Vercel**
1. Go to https://vercel.com and log in
2. Click "Add New" → "Project"
3. Import your GitHub repository (kpi-dashboard)
4. Fill in the form:
   - **Framework**: Next.js (but since it's React, select React)
   - Actually, React apps use "Create React App" preset
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. **Add Environment Variables**:
   - `REACT_APP_API_URL`: `https://kpi-dashboard-backend.onrender.com/api`

6. Click "Deploy"

### **Step 4: Get Your Frontend URL**
Once deployed, Vercel will give you a URL like:
```
https://kpi-dashboard.vercel.app
```

---

## **🔗 FINAL STEP: UPDATE CORS in Backend**

Go back to Render and update the `FRONTEND_URL` environment variable:
```
https://your-project.vercel.app
```

This completes the connection between frontend and backend!

---

## **✅ TESTING CHECKLIST**

After deployment:
1. [ ] Open your Vercel frontend URL in browser
2. [ ] Try to login
3. [ ] Check if data loads from database
4. [ ] Test adding/editing clients
5. [ ] Check browser console for any API errors (F12)

---

## **🆘 Troubleshooting**

### **CORS Error in Browser?**
- Check backend `FRONTEND_URL` matches your Vercel URL exactly
- Restart backend on Render

### **Database Connection Error?**
- Verify `NEON_DATABASE_URL` in Render environment variables
- Check Neon dashboard for connection issues

### **API calls failing?**
- Verify `REACT_APP_API_URL` in Vercel environment variables
- Check backend logs in Render dashboard
- Open browser DevTools (F12) → Network tab to see request details

### **Backend won't deploy?**
- Check logs in Render: "Logs" tab
- Ensure `Procfile` exists in backend directory
- Verify all dependencies in `package.json` are correct

---

## **📊 ENVIRONMENT VARIABLES SUMMARY**

### **Render Backend**
```
PORT=5000
NEON_DATABASE_URL=postgresql://...
JWT_SECRET=...
NODE_ENV=production
FRONTEND_URL=https://your-vercel-url.vercel.app
```

### **Vercel Frontend**
```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## **🎉 You're Live!**

Your application is now accessible to the world!

**Frontend URL**: https://your-project.vercel.app
**Backend API**: https://your-backend.onrender.com/api
**Database**: Neon PostgreSQL

