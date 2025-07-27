# Portfolio Management Tool - Dynamic Roadmap

A comprehensive project management and scheduling tool designed for managing PDT (Product Development Team) work items with advanced capacity planning, dependency tracking, and real-time alerts.

## 🚀 Features

### Project Management
- **Visual Project Organization**: Projects are grouped and displayed on the main timeline view
- **Priority-based Sorting**: Projects are automatically sorted by highest priority
- **Editable Priority Scores**: Each project has a configurable priority score
- **Color-coded Projects**: Visual distinction with custom project colors

### PDT Work Items
- **Timeline Visualization**: Work items displayed as bars on a chronological timeline
- **Progress Tracking**: Visual progress indicators with percentage completion
- **Capacity Management**: Display of FTE allocation and duration for each work item
- **Team Assignment**: Each work item is associated with a specific PDT team

### Interactive Features
- **Drag & Drop Scheduling**: Move work items from backlog to timeline
- **Context Menus**: Right-click to edit work item details
- **Real-time Updates**: Changes reflect immediately across all views
- **Filtering**: Filter roadmap by specific PDT teams

### Backlog Management
- **Unscheduled Items**: Work items without dates appear in backlog
- **Project Grouping**: Backlog items remain organized by project
- **Drag to Schedule**: Drag items from backlog to timeline for scheduling

### Dependency Management
- **Predecessor/Successor Links**: Set dependencies between work items
- **Visual Dependency Lines**: Dependencies are drawn as arrows between bars
- **Conflict Detection**: Automatic highlighting of scheduling conflicts
- **Validation**: System prevents invalid dependency relationships

### Progress & Alert System
- **Progress Monitoring**: Visual fill indicating completion percentage
- **Delay Detection**: Alerts when progress lags expected timeline by >20%
- **Dependency Conflicts**: Warnings for overlapping dependent items
- **Capacity Overload**: Alerts when PDT teams exceed 100% capacity

### Capacity Management
- **12-Week Rolling View**: Capacity table showing next 12 weeks
- **Team Utilization**: Percentage utilization per team per week
- **Over-capacity Alerts**: Visual indicators for capacity overflow
- **Interactive Filtering**: Click teams to filter roadmap view

## 🛠️ Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: D3.js for timeline and dependency rendering
- **Date Handling**: date-fns for date calculations
- **Icons**: Lucide React
- **Build Tool**: Vite

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd portfolio-management-tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🎯 Usage Guide

### Getting Started
1. The application loads with sample data demonstrating all features
2. Projects are displayed on the left side of the timeline
3. Work items appear as colored bars showing progress and capacity
4. The backlog column on the right shows unscheduled items

### Managing Work Items
1. **Edit Work Items**: Double-click any work item bar to open the edit modal
2. **Schedule Items**: Drag items from the backlog to the timeline
3. **Move Items**: Drag scheduled items to new dates on the timeline
4. **Set Dependencies**: Use the edit modal to configure predecessor relationships

### Capacity Planning
1. **View Capacity**: Check the capacity table below the timeline
2. **Filter by Team**: Click on a PDT team row to filter the roadmap
3. **Monitor Overload**: Red cells indicate capacity exceeding 100%
4. **Clear Filters**: Use the "Clear Filter" button to show all teams

### Alert Management
1. **View Alerts**: Check the alerts panel on the right side
2. **Alert Types**: 
   - 🕐 **Delay Alerts**: Progress behind schedule
   - ⚠️ **Dependency Alerts**: Scheduling conflicts
   - 👥 **Capacity Alerts**: Team overload
3. **Dismiss Alerts**: Click the X button to dismiss individual alerts
4. **Take Action**: Click "View Work Item" or "View PDT Team" to navigate

### Project Organization
1. **Priority Management**: Projects are sorted by priority score
2. **Visual Grouping**: Each project has a distinct color and section
3. **Work Item Association**: Items stay grouped under their project

## 📊 Data Structure

### Projects
```typescript
interface Project {
  id: string;
  name: string;
  priority: number; // Higher = more important
  color: string;    // Hex color for visualization
}
```

### PDT Teams
```typescript
interface PDTTeam {
  id: string;
  name: string;
  maxCapacity: number; // Maximum FTEs
  color: string;       // Team color
}
```

### Work Items
```typescript
interface WorkItem {
  id: string;
  name: string;
  projectId: string;
  pdtTeamId: string;
  startDate?: Date;
  endDate?: Date;
  duration: number;           // Weeks
  capacity: number;           // FTEs
  completedPercentage: number; // 0-100
  dependencies: string[];     // Predecessor IDs
  successors: string[];       // Successor IDs
  isInBacklog: boolean;
}
```

## 🔧 Configuration

### Customizing Colors
Edit `tailwind.config.js` to customize the color palette:
```javascript
theme: {
  extend: {
    colors: {
      primary: { /* ... */ },
      success: { /* ... */ },
      warning: { /* ... */ },
      danger: { /* ... */ }
    }
  }
}
```

### Sample Data
Modify `src/data/sampleData.ts` to customize the initial data:
- Add/remove projects
- Configure PDT teams
- Create work items with dependencies
- Set realistic dates and capacities

## 🚨 Alert Logic

### Progress Delay Detection
```typescript
// Alert triggered when:
(elapsed_duration / total_duration) > (completed_percentage + 20%)
```

### Dependency Conflict Detection
```typescript
// Alert triggered when:
successor.start_date < predecessor.end_date
```

### Capacity Overflow Detection
```typescript
// Alert triggered when:
(weekly_capacity_used / max_capacity) > 100%
```

## 📈 Future Enhancements

- **Data Persistence**: Save/load project data
- **Export Features**: PDF reports, Excel exports
- **Advanced Filtering**: Date ranges, status filters
- **Resource Leveling**: Automatic capacity optimization
- **Gantt Chart View**: Alternative timeline visualization
- **Team Collaboration**: Multi-user editing
- **Integration**: Jira, Azure DevOps, etc.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions or issues:
1. Check the documentation above
2. Review the sample data structure
3. Open an issue on GitHub
4. Contact the development team

---

**Built with ❤️ for effective project portfolio management** 