# ForestGuard AI - Deployment Guide

This guide explains how to deploy the React + Vite frontend to **Vercel** and the FastAPI backend to **Render**, connecting them using **GitHub**.

---

## Step 1: Push Source Code to GitHub

Since your project already has a `.gitignore` configured to ignore large ML models (`backend/models/` and `*.safetensors`), you can safely push it to GitHub without exceeding file size limits.

1. Open your terminal in the project root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for deployment"
   ```
2. Create a new **public or private repository** on [GitHub](https://github.com).
3. Run the commands provided by GitHub to link and push your code:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy Backend to Render

[Render](https://render.com) is a great free cloud platform for running Python applications.

1. Sign up/Login to [Render](https://render.com) and click **New +** -> **Web Service**.
2. Connect your GitHub account and select your repository.
3. Configure the Web Service settings as follows:
   * **Name**: `forestguard-backend` (or any name you prefer)
   * **Region**: Choose the closest one to you (e.g., Singapore)
   * **Branch**: `main`
   * **Root Directory**: `backend` *(CRITICAL: This runs commands inside the `/backend` folder)*
   * **Runtime**: `Python 3` (or Python version matching your setup)
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   * **Instance Type**: `Free`
4. Click **Deploy Web Service**.
5. Once deployment is complete, Render will give you a public URL (e.g., `https://forestguard-backend.onrender.com`). Copy this URL.

---

## Step 3: Deploy Frontend to Vercel

[Vercel](https://vercel.com) is the ideal platform for deploying React/Vite applications.

1. Sign up/Login to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
2. Select your GitHub repository and click **Import**.
3. Configure the Project settings:
   * **Framework Preset**: `Vite` (Vercel auto-detects this)
   * **Root Directory**: `./` (leave default)
   * **Build and Output Settings**: Leave as default (`npm run build` and `dist`)
4. Expand the **Environment Variables** section and add:
   * **`VITE_API_BASE_URL`**: Your Render backend URL (e.g., `https://forestguard-backend.onrender.com`)
   * **`VITE_GOOGLE_MAPS_API_KEY`**: Your Google Maps API Key (Paste your API key here)
5. Click **Deploy**.
6. Once deployed, Vercel will give you a public domain (e.g., `https://deforestation-detection-system.vercel.app`).

---

## Verify Deployment

Open your Vercel URL in the browser and test:
1. Go to the **Hunting Console** page.
2. Enter some text (e.g., *"Possible gunshot heard in the east sector"*) and click **Run Analysis**.
3. The app should communicate with your Render backend, analyze the text, and return the classification results successfully.
