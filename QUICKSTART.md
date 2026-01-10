# Quick Start Guide - Upload to GitHub

Follow these steps to get your Photo Annotator app on GitHub:

## Step 1: Download the Project Files

Download all the files from the `photo-annotator` folder.

## Step 2: Create a New GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the **+** icon in the top-right corner
3. Select **New repository**
4. Name it: `photo-annotator` (or any name you prefer)
5. Choose **Public** or **Private**
6. **Do NOT** check "Initialize with README" (we already have one)
7. Click **Create repository**

## Step 3: Upload Files to GitHub

### Option A: Using GitHub Website (Easiest)

1. On your new repository page, click **uploading an existing file**
2. Drag and drop ALL the files/folders you downloaded:
   - `.gitignore`
   - `README.md`
   - `index.html`
   - `package.json`
   - `vite.config.js`
   - `src/` folder (with all contents)
3. Add a commit message: `Initial commit`
4. Click **Commit changes**

### Option B: Using Git Command Line

If you have Git installed:

```bash
# Navigate to the project folder
cd path/to/photo-annotator

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/photo-annotator.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 4: Run the Project Locally

After uploading to GitHub, to run it on your computer:

```bash
# Clone your repository
git clone https://github.com/YOUR_USERNAME/photo-annotator.git

# Navigate to folder
cd photo-annotator

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser!

## Step 5: Deploy Online (Optional)

### Deploy to Vercel (Recommended - Free & Easy)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New Project**
4. Import your `photo-annotator` repository
5. Click **Deploy**
6. Done! You'll get a live URL like `photo-annotator.vercel.app`

### Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign in with GitHub
3. Click **Add new site** → **Import an existing project**
4. Select your `photo-annotator` repository
5. Build settings are auto-detected
6. Click **Deploy**

## Need Help?

Check the full README.md for detailed documentation, or open an issue on GitHub.

---

**Your app is now on GitHub!** 🎉
