# Portfolio Management Tool

A comprehensive React-based portfolio management application for tracking projects, work items, and team capacity with advanced alerting and timeline visualization.

## 🚀 Features

### 📊 **Timeline View**
- Interactive roadmap with drag-and-drop functionality
- Visual project timelines with work item bars
- Current date indicator with dotted line styling
- Expandable/collapsible project groups

### 📈 **Capacity Management**
- Dedicated capacity page with team overview
- Percentage-based capacity tracking (e.g., 80% max capacity)
- Color-coded capacity indicators (Green/Blue/Yellow/Red)
- Real-time capacity calculations per week

### ⚠️ **Smart Alert System**
- **Progress Delays**: Current work items behind schedule
- **Past Incomplete Work**: Work items that ended but aren't 100% complete
- **Future Work Issues**: Work items with future start dates but completion percentages
- **Backlog Issues**: Backlog items with inappropriate completion percentages
- **Dependency Conflicts**: Work items with overlapping dependencies
- **Acknowledge System**: Dismiss specific dependency alerts

### 🎯 **Interactive Features**
- Click-based alert popovers with detailed information
- Drag-and-drop work item reordering
- Automatic date-based sorting
- Responsive design with modern UI

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Date Handling**: date-fns
- **Development Server**: Express.js

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jordan-Ryan/Portfolio-Management-Tool.git
   cd Portfolio-Management-Tool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the application**
   ```bash
   npm run build
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3001`

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── TimelineView.tsx     # Main timeline component
│   ├── TimelineBar.tsx      # Individual work item bars
│   ├── CapacityTable.tsx    # Capacity management table
│   ├── BacklogColumn.tsx    # Backlog items display
│   ├── Navigation.tsx       # Navigation between pages
│   └── WorkItemModal.tsx    # Work item details modal
├── pages/              # Page components
│   └── CapacityPage.tsx     # Dedicated capacity page
├── data/               # Sample data and configurations
│   └── sampleData.ts        # Test data for demonstration
├── types/              # TypeScript type definitions
│   └── index.ts             # Interface definitions
├── utils/              # Utility functions
│   ├── calculations.ts      # Alert and capacity calculations
│   └── dateUtils.ts         # Date manipulation utilities
└── App.tsx             # Main application component
```

## 🎨 Key Components

### TimelineView
- Renders the main roadmap with project groups
- Handles drag-and-drop functionality
- Manages work item positioning and alerts

### TimelineBar
- Individual work item visualization
- Alert indicators with click-based popovers
- Progress and completion status display

### CapacityTable
- Team capacity overview with percentage-based tracking
- Color-coded capacity indicators
- Current date line integration

## 🔧 Configuration

### Alert Types
The application supports multiple alert types:

1. **Progress Delays**: `hasDelay`
   - Only applies to current (ongoing) work items
   - Shows current vs. expected progress

2. **Past Incomplete Work**: `hasPastIncomplete`
   - Applies to work items that have ended
   - Must be 100% complete if past end date

3. **Future Work Issues**: `hasFutureCompletion`
   - Work items with future start dates shouldn't have completion percentages

4. **Backlog Issues**: `hasBacklogCompletion`
   - Backlog items shouldn't have completion percentages

5. **Dependency Conflicts**: `hasDependencyConflict`
   - Work items with overlapping dependencies
   - Supports acknowledgment system

### Capacity System
- **Percentage-based**: Max capacity is set as a percentage (e.g., 80%)
- **Color Coding**:
  - Green: 0-60% of max capacity
  - Blue: 61-80% of max capacity
  - Yellow: 81-100% of max capacity
  - Red: >100% of max capacity

## 🚀 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm start` - Start production server

### Adding New Features

1. **New Alert Types**: Add logic to `src/utils/calculations.ts`
2. **UI Components**: Create new components in `src/components/`
3. **Data Models**: Update interfaces in `src/types/index.ts`
4. **Sample Data**: Modify `src/data/sampleData.ts` for testing

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions or support, please open an issue on the [GitHub repository](https://github.com/Jordan-Ryan/Portfolio-Management-Tool/issues). 