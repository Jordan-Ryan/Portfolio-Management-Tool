# New Drag and Drop System

## Overview
The Portfolio Management Tool now uses a custom drag and drop system that provides a more intuitive and responsive user experience.

## Key Features

### 1-Second Hold to Activate
- **Hold Duration**: Users must hold down on a work item for 1 second to initiate drag
- **Visual Feedback**: Cursor changes to a closed hand (grab) during drag operations
- **Timeout Management**: If released before 1 second, drag is cancelled and normal click behavior occurs

### Ghost Item Visualization
- **Identical Styling**: Ghost item appears as an exact visual replica of the original work item
- **Full Information Display**: Shows work item name, team, capacity, duration, and alert indicators
- **Precise Positioning**: Ghost follows cursor with pixel-perfect accuracy
- **Alert Indicators**: Warning icons and styling for items with issues

### Visual Feedback
- **Cursor Changes**: Transitions to closed hand cursor during drag
- **Original Item Hiding**: Original work item disappears from timeline/backlog during drag
- **Smooth Movement**: Ghost item follows mouse movement smoothly
- **Text Selection Prevention**: Prevents text highlighting during drag operations

### Drop Precision
- **Accurate Positioning**: Items drop exactly where the ghost item appears
- **Week Alignment**: Items snap to week boundaries on the timeline
- **Backlog Support**: Backlog items can be dragged to timeline positions
- **No Offset Issues**: Eliminates positioning offset problems

## Technical Implementation

### State Management
```typescript
const [ghostItem, setGhostItem] = useState<{ workItem: WorkItem; x: number; y: number } | null>(null);
const [dragTimeout, setDragTimeout] = useState<NodeJS.Timeout | null>(null);
```

### Event Handling
- **Mouse Down**: Starts 1-second timer
- **Mouse Move**: Updates ghost item position
- **Mouse Up**: Handles drop logic and cleanup

### Cursor Management
```typescript
document.body.style.cursor = 'grab'; // Closed hand cursor during drag
```

### Text Selection Prevention
```typescript
document.body.style.userSelect = 'none';
(document.body.style as any).webkitUserSelect = 'none';
(document.body.style as any).mozUserSelect = 'none';
(document.body.style as any).msUserSelect = 'none';
```

## User Experience

### For Timeline Items
1. **Hold for 1 second** on any timeline work item
2. **Ghost appears** with identical styling
3. **Drag to desired position** on timeline
4. **Drop precisely** - item appears exactly where ghost was

### For Backlog Items
1. **Hold for 1 second** on any backlog item
2. **Ghost appears** with work item information
3. **Drag to timeline position** 
4. **Drop to schedule** - item moves from backlog to timeline

### Benefits
- **Intuitive**: Natural hold-to-drag interaction
- **Precise**: Pixel-perfect positioning
- **Responsive**: 1-second activation feels snappy
- **Visual**: Clear feedback with ghost items and cursor changes
- **Reliable**: No accidental drags or positioning issues 