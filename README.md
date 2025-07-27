# Portfolio Management Tool

A comprehensive web-based portfolio management application for tracking projects, PDT teams, work items, and capacity planning with interactive timeline visualization.

## 🚀 Live Demo

**Access the application:** [Portfolio Management Tool](https://jordan-ryan.github.io/Portfolio-Management-Tool/)

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [User Guide](#user-guide)
- [Technical Documentation](#technical-documentation)
- [Development](#development)
- [Deployment](#deployment)

## ✨ Features

### 🎯 Core Functionality
- **Interactive Timeline**: Drag-and-drop work items on a visual timeline
- **Multi-Project Management**: Track multiple projects with their respective work items
- **PDT Team Capacity**: Monitor team capacity with percentage-based tracking
- **Smart Alerts**: Automated issue detection and alerting system
- **Backlog Management**: Organize and prioritize work items
- **Dependency Tracking**: Manage work item dependencies and conflicts

### 🎨 User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Real-time Updates**: Instant feedback on all interactions
- **Multi-select Filtering**: Filter by PDT teams and projects
- **Alert System**: Visual indicators for issues and conflicts

### 📊 Data Management
- **Work Item Editing**: Inline editing with modal interface
- **Dependency Management**: Add/remove predecessors and successors
- **Capacity Planning**: Track team utilization and overflow
- **Progress Tracking**: Monitor completion status and delays

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Jordan-Ryan/Portfolio-Management-Tool.git

# Navigate to project directory
cd Portfolio-Management-Tool

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 📖 User Guide

### 🏠 Main Dashboard

The application has two main views accessible via the navigation bar:

1. **Project Roadmap** - Interactive timeline view
2. **PDT Team Capacity** - Capacity planning and monitoring

### 📅 Project Roadmap

The Project Roadmap provides an interactive timeline view of all projects and their work items.

#### **Timeline Navigation**
- **Week Headers**: Click on week headers to see date ranges
- **Zoom Controls**: Use mouse wheel to zoom in/out
- **Pan**: Click and drag to pan across the timeline

#### **Work Item Management**

**Viewing Work Items:**
- Work items appear as colored bars on the timeline
- Each bar shows: Work item name, PDT team, and capacity percentage
- Alert icons (⚠️) indicate issues that need attention

**Editing Work Items:**
1. **Single-click** on any work item to open the edit modal
2. Modify details like name, dates, capacity, PDT team, or dependencies
3. Click "Save Changes" to update

**Moving Work Items:**
1. **Drag and drop** work items to new positions on the timeline
2. Hold for 1 second to activate drag mode
3. Drop on the desired week to reposition

**Alert System:**
- Click the ⚠️ icon on work items to view detailed alerts
- Alerts include:
  - **Behind Schedule**: Work items past their end date
  - **Past Work Incomplete**: Past work items not 100% complete
  - **Dependency Conflicts**: Overlapping dependencies
  - **Progress Delays**: Work items behind schedule

#### **Filtering and Search**

**PDT Team Filter:**
1. Click the "PDT Team" dropdown in the top toolbar
2. Select multiple teams to filter by
3. Use "Clear Filter" to remove all filters

**Project Filter:**
1. Click the "Project" dropdown in the top toolbar
2. Select multiple projects to filter by
3. Use "Clear Filter" to remove all filters

#### **Project Expansion**
- Click the expand/collapse arrow next to project names
- Expanded projects show:
  - **Backlog Column**: Work items not yet scheduled
  - **Timeline Area**: Scheduled work items on the timeline

### 👥 PDT Team Capacity

The PDT Team Capacity page provides detailed capacity planning and monitoring.

#### **Capacity Table**
- **Team Overview**: Each row represents a PDT team
- **Weekly Capacity**: Columns show capacity for each week
- **Color Coding**: 
  - Green: Under capacity (< 80%)
  - Yellow: Near capacity (80-100%)
  - Red: Over capacity (> 100%)
- **Overflow Indicators**: Shows +X% or -X% for capacity differences

#### **Capacity Management**
- **Percentage-based**: Capacity is shown as percentages (e.g., 80% max)
- **Weekly Tracking**: Monitor capacity changes week by week
- **Visual Indicators**: Color-coded cells for quick assessment

### 🔧 Work Item Modal

The work item editing modal provides comprehensive management capabilities.

#### **Basic Information**
- **Name**: Work item title
- **Start/End Dates**: Timeline positioning
- **Duration**: Automatically calculated from dates
- **Capacity**: Percentage allocation
- **PDT Team**: Assigned team
- **Completion**: Progress percentage

#### **Dependency Management**

**Predecessors (Dependencies):**
- Shows work items that must be completed before this item
- Click "Remove" to delete dependencies
- Use "Add Dependency" to create new dependencies

**Successors (Dependents):**
- Shows work items that depend on this item
- Click "Remove" to delete dependents
- Use "Add Dependency" to create new dependencies

**Adding Dependencies:**
1. Click "Add Dependency" button
2. Choose dependency type (Predecessor/Successor)
3. Search by ID or work item name
4. Select the desired work item
5. Click "Add" to create the dependency

#### **Alert Acknowledgment**
- For dependency conflicts, click "Acknowledge Dependency"
- This dismisses the specific alert for that dependency
- Acknowledged dependencies won't show alerts again

### 🚨 Alert System

The application automatically detects and alerts on various issues:

#### **Alert Types**
1. **Behind Schedule**: Work items past their end date
2. **Past Work Incomplete**: Past work items not 100% complete
3. **Dependency Conflicts**: Overlapping work item dependencies
4. **Progress Delays**: Work items behind their expected progress

#### **Alert Management**
- Click ⚠️ icons to view detailed alert information
- Alerts show specific details about the issue
- Use "Acknowledge Dependency" to dismiss dependency alerts
- Alerts are automatically updated as work items change

## 🛠 Technical Documentation

### Architecture Overview

```
src/
├── components/          # React components
│   ├── TimelineView.tsx    # Main timeline component
│   ├── CapacityTable.tsx   # Capacity planning table
│   ├── WorkItemModal.tsx   # Work item editing modal
│   ├── AlertsPopover.tsx   # Alert display component
│   ├── Navigation.tsx      # Navigation bar
│   └── ...
├── pages/              # Page components
│   └── CapacityPage.tsx    # Capacity page
├── data/               # Sample data and types
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

### Key Components

#### **TimelineView.tsx**
- **Purpose**: Main timeline visualization component
- **Features**: 
  - SVG-based timeline rendering
  - Drag-and-drop functionality
  - Work item positioning
  - Alert system integration
  - Multi-select filtering

#### **CapacityTable.tsx**
- **Purpose**: Capacity planning and monitoring
- **Features**:
  - Weekly capacity tracking
  - Color-coded capacity indicators
  - Overflow/underflow calculations
  - Percentage-based capacity display

#### **WorkItemModal.tsx**
- **Purpose**: Work item editing interface
- **Features**:
  - Comprehensive work item editing
  - Dependency management
  - Alert acknowledgment
  - Form validation

### Data Flow

1. **State Management**: React useState hooks manage application state
2. **Data Updates**: Changes trigger re-renders and alert regeneration
3. **Event Handling**: User interactions update state and trigger calculations
4. **Alert Generation**: Utility functions analyze data and generate alerts

### Key Algorithms

#### **Alert Generation**
```typescript
// Generate alerts for work items
const alerts = generateAlerts(workItems, pdtTeams);
```

#### **Capacity Calculation**
```typescript
// Calculate capacity for specific week
const capacity = calculateCapacityForWeek(workItems, weekIndex);
```

#### **Dependency Analysis**
```typescript
// Check for dependency conflicts
const conflicts = checkDependencyConflict(workItem, allWorkItems);
```

## 🚀 Development

### Project Structure
```
Portfolio-Management-Tool/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── data/          # Sample data
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript types
│   └── ...
├── public/            # Static assets
├── dist/              # Build output
└── ...
```

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit checks

## 🌐 Deployment

### GitHub Pages Deployment
The application is automatically deployed to GitHub Pages via GitHub Actions.

**Deployment Process:**
1. Code is pushed to the `main` branch
2. GitHub Actions workflow triggers
3. Application is built and deployed to GitHub Pages
4. Available at: https://jordan-ryan.github.io/Portfolio-Management-Tool/

### Manual Deployment
```bash
# Build the application
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📝 Version History

### v1.0.0 (Current)
- ✅ Interactive timeline with drag-and-drop
- ✅ Multi-project management
- ✅ PDT team capacity planning
- ✅ Smart alert system
- ✅ Dependency management
- ✅ Multi-select filtering
- ✅ Responsive design
- ✅ GitHub Pages deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Create an issue on GitHub
- Check the documentation
- Review the implementation summary

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS** 