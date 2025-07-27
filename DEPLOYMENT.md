# Portfolio Management Tool - Deployment Guide

## 🚀 Production Server Setup

The Portfolio Management Tool is now successfully hosted on a local production server!

### Current Status
- ✅ **Development Server**: Running on http://localhost:3000
- ✅ **Production Server**: Running on http://localhost:3001
- ✅ **Build Complete**: Production assets in `/dist` directory

## 🌐 Access Your Application

### Development Environment
```bash
# Start development server (hot reload)
npm run dev
# Access at: http://localhost:3000
```

### Production Environment
```bash
# Build and start production server
npm run build
npm start
# Access at: http://localhost:3001
```

### Quick Deployment Script
```bash
# Use the automated deployment script
./scripts/deploy.sh
```

## 🏗️ Server Architecture

### Production Server (Express.js)
- **Port**: 3001 (configurable via PORT environment variable)
- **Static Files**: Served from `/dist` directory
- **SPA Support**: All routes serve `index.html` for client-side routing
- **Performance**: Optimized production build with minification

### File Structure
```
Portfolio Management Tool/
├── dist/                    # Production build files
│   ├── index.html          # Main HTML file
│   └── assets/             # Compiled CSS and JS
├── server.js               # Express production server
├── package.json            # Dependencies and scripts
└── scripts/
    ├── dev.sh              # Development script
    └── deploy.sh           # Production deployment script
```

## 🔧 Deployment Options

### 1. Local Production Server (Current)
```bash
# Build and start
npm run build
npm start
```

### 2. Vite Preview Server
```bash
# Build and preview
npm run build
npm run preview
```

### 3. Custom Port Configuration
```bash
# Set custom port
PORT=8080 npm start
```

### 4. Environment Variables
```bash
# Production environment
NODE_ENV=production PORT=3001 npm start
```

## 🌍 External Hosting Options

### 1. Heroku Deployment
```bash
# Create Procfile
echo "web: node server.js" > Procfile

# Deploy to Heroku
heroku create your-app-name
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### 2. Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### 3. Netlify Deployment
```bash
# Build command
npm run build

# Publish directory
dist/
```

### 4. Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 📊 Performance Optimization

### Production Build Features
- **Code Splitting**: Automatic chunk optimization
- **Tree Shaking**: Unused code elimination
- **Minification**: Compressed CSS and JavaScript
- **Gzip Compression**: Reduced file sizes
- **Caching**: Optimized asset caching

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
# Check dist/assets/ for file sizes
```

## 🔒 Security Considerations

### Production Security
- **HTTPS**: Use HTTPS in production
- **Environment Variables**: Secure sensitive data
- **CORS**: Configure cross-origin requests
- **Rate Limiting**: Implement request throttling

### Environment Configuration
```bash
# Create .env file
NODE_ENV=production
PORT=3001
```

## 📈 Monitoring and Logging

### Server Logs
```bash
# View server logs
npm start 2>&1 | tee server.log
```

### Health Check Endpoint
```javascript
// Add to server.js
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
```

## 🚀 Scaling Considerations

### Load Balancing
- Use multiple server instances
- Implement reverse proxy (nginx)
- Configure session management

### Database Integration
- Add MongoDB/PostgreSQL for data persistence
- Implement user authentication
- Add real-time collaboration features

## 🔄 Continuous Deployment

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm start
```

## 📞 Support and Troubleshooting

### Common Issues
1. **Port Already in Use**: Change PORT environment variable
2. **Build Failures**: Check TypeScript errors
3. **Missing Dependencies**: Run `npm install`
4. **Permission Errors**: Check file permissions

### Debug Commands
```bash
# Check server status
curl http://localhost:3001/health

# View server logs
tail -f server.log

# Check process
ps aux | grep node
```

## 🎉 Success!

Your Portfolio Management Tool is now successfully deployed and running on:
- **Development**: http://localhost:3000
- **Production**: http://localhost:3001

The application includes all features:
- ✅ Project timeline visualization
- ✅ PDT team capacity management
- ✅ Drag-and-drop scheduling
- ✅ Real-time alerts and notifications
- ✅ Dependency tracking
- ✅ Progress monitoring

Access the application and start managing your project portfolio! 