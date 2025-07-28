# Deployment Guide

## 🚀 Automatic Deployment

This project uses **GitHub Actions** for automatic deployment to GitHub Pages. No manual deployment is required!

### How It Works

1. **Push to `main` branch** - Any changes pushed to the main branch
2. **GitHub Actions triggers** - Automatic build and deployment workflow
3. **Build and deploy** - Application is built and deployed to GitHub Pages
4. **Live at**: https://jordan-ryan.github.io/Portfolio-Management-Tool/

### Development Workflow

```bash
# Make your changes locally
npm run dev

# Commit and push to main
git add .
git commit -m "Your changes"
git push origin main

# That's it! GitHub Actions will deploy automatically
```

### Monitoring Deployments

- Go to the **Actions** tab on your GitHub repo
- You'll see a workflow run for each push to `main`
- If there's a failure, you'll see logs and errors there

### Configuration Files

- **`.github/workflows/deploy.yml`** - GitHub Actions workflow
- **`vite.config.ts`** - Vite configuration with correct base path
- **`package.json`** - Build scripts and dependencies

### What Was Removed

- ❌ `scripts/deploy.sh` - Manual deployment script (deleted)
- ❌ `gh-pages` dependency - No longer needed
- ❌ Manual deploy commands - Everything is automatic now

### Benefits

- ✅ **Zero manual deployment** - Just push to main
- ✅ **Reliable and safe** - GitHub Actions handles everything
- ✅ **Automatic rollback** - Previous versions are preserved
- ✅ **No local dependencies** - No need for gh-pages package
- ✅ **Consistent builds** - Same environment every time

---

**Note**: The old manual deployment scripts have been removed to keep the codebase clean and prevent confusion. All deployment is now handled automatically by GitHub Actions. 