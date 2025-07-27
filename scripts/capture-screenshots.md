# Screenshot Capture Guide

## 📸 **Screenshots Needed for Documentation**

The following screenshots should be captured from the live application at: http://localhost:3001/Portfolio-Management-Tool/

### **Required Screenshots:**

#### **1. Navigation Bar**
- **File**: `docs/screenshots/navigation.png`
- **Description**: Top navigation bar showing "Project Roadmap" and "PDT Team Capacity" tabs
- **Instructions**: Capture the top navigation area

#### **2. Timeline Overview**
- **File**: `docs/screenshots/timeline-overview.png`
- **Description**: Main timeline view showing projects and work items
- **Instructions**: Capture the full timeline with week headers and project groups

#### **3. Work Items**
- **File**: `docs/screenshots/work-items.png`
- **Description**: Close-up of work item bars showing names, teams, and alert icons
- **Instructions**: Focus on individual work item bars with their details

#### **4. Drag and Drop**
- **File**: `docs/screenshots/drag-drop.png`
- **Description**: Work item being dragged to a new position
- **Instructions**: Capture a work item mid-drag operation

#### **5. Alert Popover**
- **File**: `docs/screenshots/alert-popover.png`
- **Description**: Alert popover showing detailed issue information
- **Instructions**: Click on a work item with an alert icon (⚠️) and capture the popover

#### **6. Project Expansion**
- **File**: `docs/screenshots/project-expansion.png`
- **Description**: Expanded project showing backlog column and timeline area
- **Instructions**: Click the expand arrow next to a project name and capture the expanded view

#### **7. Capacity Table**
- **File**: `docs/screenshots/capacity-table.png`
- **Description**: PDT Team Capacity page with color-coded capacity indicators
- **Instructions**: Navigate to "PDT Team Capacity" tab and capture the full table

#### **8. Work Item Modal - Basic**
- **File**: `docs/screenshots/work-item-modal-basic.png`
- **Description**: Work item editing modal with basic information tab
- **Instructions**: Click on any work item to open the modal and capture the basic info tab

#### **9. Work Item Modal - Dependencies**
- **File**: `docs/screenshots/work-item-modal-dependencies.png`
- **Description**: Work item modal showing dependencies tab
- **Instructions**: In the work item modal, click the "Dependencies" tab and capture

#### **10. Add Dependency**
- **File**: `docs/screenshots/add-dependency.png`
- **Description**: Add dependency popup with search functionality
- **Instructions**: In the dependencies tab, click "Add Dependency" and capture the popup

#### **11. Alert Acknowledgment**
- **File**: `docs/screenshots/alert-acknowledgment.png`
- **Description**: Alert popover with "Acknowledge Dependency" button
- **Instructions**: Capture an alert popover that shows the acknowledge button

#### **12. PDT Team Filter**
- **File**: `docs/screenshots/pdt-filter.png`
- **Description**: PDT Team filter dropdown with multi-select options
- **Instructions**: Click the "PDT Team" dropdown in the top toolbar and capture

#### **13. Project Filter**
- **File**: `docs/screenshots/project-filter.png`
- **Description**: Project filter dropdown with multi-select options
- **Instructions**: Click the "Project" dropdown in the top toolbar and capture

## 🛠️ **How to Capture Screenshots:**

### **On macOS:**
1. **Full Window**: `Cmd + Shift + 3`
2. **Selected Area**: `Cmd + Shift + 4`
3. **Specific Window**: `Cmd + Shift + 4`, then press `Space`

### **On Windows:**
1. **Full Screen**: `PrtScn`
2. **Active Window**: `Alt + PrtScn`
3. **Snipping Tool**: Search for "Snipping Tool" in Start menu

### **On Linux:**
1. **Full Screen**: `PrtScn`
2. **Selected Area**: `Shift + PrtScn`
3. **Terminal Command**: `gnome-screenshot` or `import` (ImageMagick)

## 📁 **File Organization:**

```
docs/
├── screenshots/
│   ├── navigation.png
│   ├── timeline-overview.png
│   ├── work-items.png
│   ├── drag-drop.png
│   ├── alert-popover.png
│   ├── project-expansion.png
│   ├── capacity-table.png
│   ├── work-item-modal-basic.png
│   ├── work-item-modal-dependencies.png
│   ├── add-dependency.png
│   ├── alert-acknowledgment.png
│   ├── pdt-filter.png
│   └── project-filter.png
└── USER_GUIDE.md
```

## 🎯 **Screenshot Guidelines:**

1. **Resolution**: Use high resolution (1920x1080 or higher)
2. **Format**: Save as PNG for best quality
3. **Focus**: Ensure the relevant UI elements are clearly visible
4. **Context**: Include enough surrounding context to understand the feature
5. **Consistency**: Use consistent window sizes and zoom levels

## 📝 **After Capturing:**

1. Save all screenshots to `docs/screenshots/`
2. Update the USER_GUIDE.md file to reference the actual screenshots
3. Commit the screenshots to git
4. Deploy the updated documentation

## 🚀 **Quick Capture Script:**

You can also use browser developer tools to capture screenshots:

1. Open Developer Tools (F12)
2. Go to the Console tab
3. Run: `document.documentElement.requestFullscreen()`
4. Take screenshot
5. Press Escape to exit fullscreen

---

**Note**: Once screenshots are captured, the USER_GUIDE.md file will be updated to reference the actual image files instead of placeholder text. 