# Portfolio Management Tool - Documentation Index

## 📚 Documentation Overview

This directory contains comprehensive documentation for the Portfolio Management Tool, a React-based application for managing projects, work items, and team capacity.

## 📖 Available Documentation

### **User Documentation**
- **[README.md](../README.md)** - Main project documentation with features, installation, and quick start guide
- **[USER_GUIDE.md](./USER_GUIDE.md)** - Detailed user instructions with screenshots and step-by-step guides

### **Technical Documentation**
- **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)** - Developer guide with architecture, components, and implementation details
- **[IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)** - Historical implementation summary and feature evolution
- **[DEPLOYMENT.md](../DEPLOYMENT.md)** - Deployment instructions and GitHub Pages setup

### **Project Data**
- **[codebase-summary.json](./codebase-summary.json)** - Automated project statistics and file structure

## 🎯 Documentation Purpose

### **For Users**
- **Getting Started**: Installation and basic usage
- **Feature Guide**: How to use timeline, capacity planning, and alerts
- **Troubleshooting**: Common issues and solutions
- **Best Practices**: Tips for effective portfolio management

### **For Developers**
- **Architecture**: Component structure and data flow
- **API Reference**: Function signatures and interfaces
- **Development Setup**: Local development and testing
- **Deployment**: Build and deployment processes

## 🚀 Quick Access

### **Live Application**
- **Production**: [Portfolio Management Tool](https://jordan-ryan.github.io/Portfolio-Management-Tool/)
- **Repository**: [GitHub Repository](https://github.com/Jordan-Ryan/Portfolio-Management-Tool)

### **Key Features**
- **Interactive Timeline**: Drag-and-drop work item management
- **Capacity Planning**: Team capacity tracking and overflow detection
- **Smart Alerts**: Automated issue detection and alerting
- **Multi-Project Management**: Support for multiple projects and teams
- **Dependency Tracking**: Work item dependency management

## 📋 Documentation Structure

```
docs/
├── INDEX.md                    # This file - documentation index
├── USER_GUIDE.md              # User instructions and screenshots
├── TECHNICAL_DOCUMENTATION.md # Developer guide and architecture
└── codebase-summary.json      # Project statistics
```

## 🔧 Development Resources

### **Technology Stack**
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

### **Key Components**
- **TimelineView**: Main timeline visualization
- **CapacityTable**: Team capacity planning
- **WorkItemModal**: Work item editing interface
- **AlertsPopover**: Alert display system
- **Navigation**: Multi-select filtering

### **Data Models**
- **WorkItem**: Individual work items with dates, capacity, and dependencies
- **Project**: Project groups with priority and color coding
- **PDTTeam**: Team definitions with capacity limits
- **Alert**: Issue detection and alerting system

## 📈 Project Statistics

### **Current State (v1.0.0)**
- **Components**: 8 React components
- **Pages**: 1 main page with multiple views
- **Utils**: 2 utility modules
- **Types**: 1 TypeScript definitions file
- **Total Files**: 21 source files

### **Features Implemented**
- ✅ Interactive timeline with drag-and-drop
- ✅ Multi-project management
- ✅ PDT team capacity planning
- ✅ Smart alert system
- ✅ Dependency management
- ✅ Multi-select filtering
- ✅ Responsive design
- ✅ GitHub Pages deployment

## 🤝 Contributing

### **Documentation Updates**
1. Update relevant documentation files
2. Run the cleanup script: `node scripts/cleanup.js`
3. Test the application locally
4. Submit a pull request

### **Code Standards**
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- React best practices

## 📞 Support

### **Getting Help**
- **User Issues**: Check the [USER_GUIDE.md](./USER_GUIDE.md)
- **Technical Issues**: Review [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)
- **Development**: See [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)
- **GitHub Issues**: [Repository Issues](https://github.com/Jordan-Ryan/Portfolio-Management-Tool/issues)

### **Contact**
- **Repository**: [GitHub](https://github.com/Jordan-Ryan/Portfolio-Management-Tool)
- **Live Demo**: [Portfolio Management Tool](https://jordan-ryan.github.io/Portfolio-Management-Tool/)

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅ 