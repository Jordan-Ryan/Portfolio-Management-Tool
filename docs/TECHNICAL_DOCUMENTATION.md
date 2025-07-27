# Portfolio Management Tool - Technical Documentation

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [Data Flow](#data-flow)
4. [Key Algorithms](#key-algorithms)
5. [State Management](#state-management)
6. [Event Handling](#event-handling)
7. [Styling and UI](#styling-and-ui)
8. [Build and Deployment](#build-and-deployment)
9. [Performance Considerations](#performance-considerations)
10. [Testing Strategy](#testing-strategy)

## 🏗️ Architecture Overview

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Deployment**: GitHub Pages

### Project Structure

```
src/
├── components/          # React components
│   ├── TimelineView.tsx    # Main timeline component (SVG-based)
│   ├── TimelineBar.tsx     # Individual work item bars
│   ├── CapacityTable.tsx   # Capacity planning table
│   ├── WorkItemModal.tsx   # Work item editing modal
│   ├── AlertsPopover.tsx   # Alert display component
│   ├── Navigation.tsx      # Navigation bar
│   ├── AlertsPanel.tsx     # Alerts overview panel
│   └── BacklogColumn.tsx   # Backlog items display
├── pages/              # Page components
│   └── CapacityPage.tsx    # Capacity page
├── data/               # Sample data and configurations
│   └── sampleData.ts       # Test data for demonstration
├── utils/              # Utility functions
│   └── calculations.ts     # Alert and capacity calculations
├── types/              # TypeScript type definitions
│   └── index.ts            # Interface definitions
└── App.tsx             # Main application component
```

## 🧩 Component Structure

### Core Components

#### **App.tsx** - Main Application Component
```typescript
// Key responsibilities:
- Global state management
- Navigation between pages
- Work item editing modal
- Alert system coordination
```

**Key State:**
- `workItems`: Array of all work items
- `projects`: Array of all projects
- `pdtTeams`: Array of all PDT teams
- `alerts`: Generated alerts from calculations
- `selectedPDTFilter`: Multi-select PDT team filter
- `selectedProjectFilter`: Multi-select project filter

#### **TimelineView.tsx** - Main Timeline Component
```typescript
// Key responsibilities:
- SVG-based timeline rendering
- Drag-and-drop functionality
- Work item positioning
- Alert system integration
- Multi-select filtering
```

**Key Features:**
- **SVG Canvas**: 52-week timeline with week headers
- **Work Item Bars**: Positioned absolutely on timeline
- **Drag and Drop**: 1-second hold to activate
- **Alert Icons**: Click-based popover display
- **Project Groups**: Expandable/collapsible sections

#### **CapacityTable.tsx** - Capacity Planning Component
```typescript
// Key responsibilities:
- Weekly capacity tracking
- Color-coded capacity indicators
- Overflow/underflow calculations
- Percentage-based capacity display
```

**Key Features:**
- **Weekly Columns**: 52 weeks of capacity data
- **Color Coding**: Green/Yellow/Red based on capacity
- **Overflow Indicators**: +X% or -X% display
- **Team Rows**: Each PDT team has its own row

#### **WorkItemModal.tsx** - Work Item Editing Component
```typescript
// Key responsibilities:
- Comprehensive work item editing
- Dependency management
- Alert acknowledgment
- Form validation
```

**Key Features:**
- **Tabbed Interface**: Basic info and dependencies
- **Dependency Management**: Predecessors and successors
- **Add Dependency**: Search and select functionality
- **Form Validation**: Real-time validation

### Supporting Components

#### **AlertsPopover.tsx** - Alert Display Component
```typescript
// Key responsibilities:
- Alert popover rendering
- Alert message formatting
- Acknowledge functionality
- Portal-based positioning
```

#### **Navigation.tsx** - Navigation Component
```typescript
// Key responsibilities:
- Page navigation
- Filter dropdowns
- Multi-select functionality
- Clear filter options
```

## 🔄 Data Flow

### State Management Flow

1. **Initial Load**
   ```typescript
   App.tsx → Load sample data → Set initial state
   ```

2. **Work Item Updates**
   ```typescript
   User action → WorkItemModal → App.tsx → Update workItems → Regenerate alerts
   ```

3. **Filter Changes**
   ```typescript
   User selection → Navigation → App.tsx → Update filters → Filter components
   ```

4. **Alert Generation**
   ```typescript
   workItems change → generateAlerts() → Update alerts state → Display in components
   ```

### Event Handling Flow

#### **Drag and Drop**
```typescript
1. onMouseDown → Start drag timer
2. setTimeout(1000ms) → Enable drag
3. onDragStart → Set dragged item
4. onDrop → Calculate new position
5. Update work item dates
```

#### **Alert Display**
```typescript
1. Click alert icon → Set openBacklogPopover
2. createPortal → Render popover
3. Position relative to work item
4. Display alert messages
```

## 🧮 Key Algorithms

### Alert Generation Algorithm

```typescript
export function generateAlerts(workItems: WorkItem[], pdtTeams: PDTTeam[]): Alert[] {
  const alerts: Alert[] = [];
  
  workItems.forEach(workItem => {
    // Check for progress delays
    if (hasProgressDelay(workItem)) {
      alerts.push({
        id: `delay-${workItem.id}`,
        workItemId: workItem.id,
        type: 'progress_delay',
        message: 'Work item is behind schedule',
        details: getProgressDelayDetails(workItem)
      });
    }
    
    // Check for past incomplete work
    if (hasPastIncomplete(workItem)) {
      alerts.push({
        id: `incomplete-${workItem.id}`,
        workItemId: workItem.id,
        type: 'past_incomplete',
        message: 'Past work should be 100% complete',
        details: 'Work item has ended but is not 100% complete'
      });
    }
    
    // Check for dependency conflicts
    const conflicts = checkDependencyConflict(workItem, workItems);
    conflicts.forEach(conflict => {
      alerts.push({
        id: `dependency-${workItem.id}-${conflict.id}`,
        workItemId: workItem.id,
        type: 'dependency_conflict',
        message: 'Dependency conflict detected',
        details: getDependencyConflictDetails(workItem, conflict)
      });
    });
  });
  
  return alerts;
}
```

### Capacity Calculation Algorithm

```typescript
export function calculateCapacityForWeek(
  workItems: WorkItem[], 
  weekIndex: number, 
  pdtTeamId: string
): number {
  const weekStart = addWeeks(baseDate, weekIndex);
  const weekEnd = addWeeks(weekStart, 1);
  
  return workItems
    .filter(item => 
      item.pdtTeamId === pdtTeamId &&
      item.startDate &&
      item.endDate &&
      isWithinInterval(new Date(), { start: weekStart, end: weekEnd })
    )
    .reduce((total, item) => total + (item.capacity || 0), 0);
}
```

### Dependency Conflict Detection

```typescript
export function checkDependencyConflict(
  workItem: WorkItem, 
  allWorkItems: WorkItem[]
): WorkItem[] {
  const conflicts: WorkItem[] = [];
  
  workItem.dependencies?.forEach(dependencyId => {
    const dependency = allWorkItems.find(item => item.id === dependencyId);
    if (dependency && hasOverlap(workItem, dependency)) {
      conflicts.push(dependency);
    }
  });
  
  return conflicts;
}
```

## 📊 State Management

### Global State Structure

```typescript
interface AppState {
  // Core data
  workItems: WorkItem[];
  projects: Project[];
  pdtTeams: PDTTeam[];
  
  // UI state
  currentPage: 'roadmap' | 'capacity';
  editingWorkItem: WorkItem | null;
  isModalOpen: boolean;
  
  // Filters
  selectedPDTFilter: string[];
  selectedProjectFilter: string[];
  
  // Alerts
  alerts: Alert[];
  isAlertsPopoverOpen: boolean;
}
```

### State Update Patterns

#### **Work Item Updates**
```typescript
const handleWorkItemSave = (updatedWorkItem: WorkItem) => {
  setWorkItems(prev => 
    prev.map(item => 
      item.id === updatedWorkItem.id ? updatedWorkItem : item
    )
  );
};
```

#### **Filter Updates**
```typescript
const handlePDTFilterChange = (pdtTeamIds: string[]) => {
  setSelectedPDTFilter(pdtTeamIds);
};
```

#### **Alert Generation**
```typescript
useEffect(() => {
  const newAlerts = generateAlerts(workItems, pdtTeams);
  setAlerts(newAlerts);
}, [workItems, pdtTeams]);
```

## 🎯 Event Handling

### Drag and Drop Implementation

```typescript
// TimelineView.tsx
const handleDragStart = (e: React.DragEvent, workItem: WorkItem) => {
  if (dragTimeoutRef.current) {
    clearTimeout(dragTimeoutRef.current);
  }
  
  dragTimeoutRef.current = setTimeout(() => {
    setDraggedItem(workItem);
    e.dataTransfer.effectAllowed = 'move';
  }, 1000);
};

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  if (!draggedItem) return;
  
  const svg = svgRef.current;
  if (!svg) return;
  
  const rect = svg.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const weekIndex = Math.floor(x / weekWidth);
  
  const newStartDate = addWeeks(baseDate, weekIndex);
  onWorkItemMove(draggedItem.id, newStartDate);
  setDraggedItem(null);
};
```

### Alert Popover Implementation

```typescript
// TimelineView.tsx
const handleAlertClick = (workItemId: string, e: React.MouseEvent) => {
  e.stopPropagation();
  setOpenBacklogPopover(openBacklogPopover === workItemId ? null : workItemId);
};

// Portal rendering
{openBacklogPopover && createPortal(
  <AlertsPopover
    workItem={workItem}
    alerts={alerts}
    onAcknowledge={handleAcknowledgeDependency}
    onClose={() => setOpenBacklogPopover(null)}
  />,
  document.body
)}
```

## 🎨 Styling and UI

### Tailwind CSS Classes

#### **Timeline Components**
```css
/* Timeline container */
.timeline-container {
  @apply relative overflow-auto bg-gray-50;
}

/* Week headers */
.week-header {
  @apply sticky top-0 z-20 bg-white border-b border-gray-200;
}

/* Work item bars */
.work-item-bar {
  @apply absolute rounded border cursor-move transition-all;
}

/* Alert icons */
.alert-icon {
  @apply absolute top-1 right-1 text-red-500 text-xs hover:text-red-700;
}
```

#### **Capacity Table**
```css
/* Capacity cells */
.capacity-cell {
  @apply border border-gray-200 p-2 text-center text-sm;
}

/* Color coding */
.capacity-under { @apply bg-green-100; }
.capacity-near { @apply bg-yellow-100; }
.capacity-over { @apply bg-red-100; }
```

#### **Modal Components**
```css
/* Modal overlay */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 z-50;
}

/* Modal content */
.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-2xl mx-auto mt-20;
}
```

### Responsive Design

```typescript
// Responsive breakpoints
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px'
};

// Responsive timeline
const timelineWidth = window.innerWidth > 1024 ? 52 * weekWidth : 26 * weekWidth;
```

## 🚀 Build and Deployment

### Build Configuration

#### **Vite Configuration**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/Portfolio-Management-Tool/',
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

#### **TypeScript Configuration**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Deployment Process

#### **GitHub Pages Deployment**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### **Manual Deployment**
```bash
# Build the application
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## ⚡ Performance Considerations

### Optimization Strategies

#### **React Optimization**
```typescript
// Memoize expensive calculations
const memoizedAlerts = useMemo(() => 
  generateAlerts(workItems, pdtTeams), 
  [workItems, pdtTeams]
);

// Use React.memo for components
const WorkItemBar = React.memo(({ workItem, ...props }) => {
  // Component implementation
});
```

#### **SVG Optimization**
```typescript
// Batch SVG updates
const updateWorkItemPositions = useCallback(() => {
  // Batch all position updates
  requestAnimationFrame(() => {
    // Update all work item positions
  });
}, [workItems]);
```

#### **Event Handling Optimization**
```typescript
// Debounce filter changes
const debouncedFilterChange = useCallback(
  debounce((filterValue) => {
    setSelectedPDTFilter(filterValue);
  }, 300),
  []
);
```

### Memory Management

#### **Cleanup Effects**
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    // Timer logic
  }, 1000);
  
  return () => clearTimeout(timer);
}, []);
```

#### **Portal Cleanup**
```typescript
useEffect(() => {
  return () => {
    // Clean up portals when component unmounts
    const existingPortal = document.querySelector('[data-alert-popover]');
    if (existingPortal) {
      existingPortal.remove();
    }
  };
}, []);
```

## 🧪 Testing Strategy

### Testing Approach

#### **Unit Testing**
```typescript
// calculations.test.ts
describe('Alert Generation', () => {
  test('should generate alerts for past incomplete work', () => {
    const workItems = [/* test data */];
    const alerts = generateAlerts(workItems, []);
    expect(alerts).toHaveLength(1);
    expect(alerts[0].type).toBe('past_incomplete');
  });
});
```

#### **Component Testing**
```typescript
// TimelineView.test.tsx
describe('TimelineView', () => {
  test('should render work items correctly', () => {
    render(<TimelineView workItems={mockWorkItems} />);
    expect(screen.getByText('Work Item 1')).toBeInTheDocument();
  });
});
```

#### **Integration Testing**
```typescript
// App.test.tsx
describe('Work Item Management', () => {
  test('should update work item on save', async () => {
    render(<App />);
    // Test work item editing flow
  });
});
```

### Test Data Management

```typescript
// test-utils.ts
export const createMockWorkItem = (overrides = {}): WorkItem => ({
  id: 'test-1',
  name: 'Test Work Item',
  startDate: new Date(),
  endDate: addWeeks(new Date(), 2),
  capacity: 50,
  pdtTeamId: 'team-1',
  projectId: 'project-1',
  completion: 0,
  ...overrides
});
```

---

**For more information, see the [User Guide](./USER_GUIDE.md) and [Implementation Summary](../IMPLEMENTATION_SUMMARY.md).** 