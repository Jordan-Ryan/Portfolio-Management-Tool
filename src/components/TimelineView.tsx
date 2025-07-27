import React, { useRef, useEffect, useState } from 'react';
import { WorkItem, Project, PDTTeam } from '../types';
import { TimelineBar } from './TimelineBar';
import { getAllWeeksInYear, getWeekIndex, getDateFromWeekIndex, getWeekOffset } from '../utils/dateUtils';
import { getWorkItemsByProject, sortWorkItemsByPDTAndRow, checkDependencyConflict, getDependencyConflictDetails, calculateProgressDelay, getProgressDelayDetails } from '../utils/calculations';

interface TimelineViewProps {
  workItems: WorkItem[];
  projects: Project[];
  pdtTeams: PDTTeam[];
  selectedPDTFilter: string[];
  selectedProjectFilter: string[];
  onEdit: (workItem: WorkItem) => void;
  onWorkItemMove: (workItemId: string, newStartDate: Date) => void;
  onPDTFilterChange: (pdtTeamIds: string[]) => void;
  onProjectFilterChange: (projectIds: string[]) => void;
  onAcknowledgeDependency: (workItemId: string, dependencyId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  workItems,
  projects,
  pdtTeams,
  selectedPDTFilter,
  selectedProjectFilter,
  onEdit,
  onWorkItemMove,
  onPDTFilterChange,
  onProjectFilterChange,
  onAcknowledgeDependency
}) => {
  const [openBacklogPopover, setOpenBacklogPopover] = useState<string | null>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isProjectFilterDropdownOpen, setIsProjectFilterDropdownOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Handle backlog popover
      if (openBacklogPopover) {
        // Don't close if clicking on the alert icon or the popover itself
        if (target.closest('[data-alert-popover]') || target.closest('[data-alert-icon]')) {
          return;
        }
        setOpenBacklogPopover(null);
      }
      
      // Handle filter dropdowns
      if (isFilterDropdownOpen && !target.closest('[data-filter-dropdown]')) {
        setIsFilterDropdownOpen(false);
      }
      if (isProjectFilterDropdownOpen && !target.closest('[data-project-filter-dropdown]')) {
        setIsProjectFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openBacklogPopover, isFilterDropdownOpen, isProjectFilterDropdownOpen]);
  const [draggedItem, setDraggedItem] = useState<WorkItem | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [ghostItem, setGhostItem] = useState<{ workItem: WorkItem; x: number; y: number } | null>(null);
  const [dragTimeout, setDragTimeout] = useState<number | null>(null);


  const weeks = getAllWeeksInYear(new Date().getFullYear()); // All 52 weeks of the year
  const baseDate = weeks[0].start; // First week as base date
  
  // Filter work items based on PDT and Project filters
  const filteredWorkItems = workItems.filter(item => {
    const matchesPDT = selectedPDTFilter.length === 0 || selectedPDTFilter.includes(item.pdtTeamId);
    const matchesProject = selectedProjectFilter.length === 0 || selectedProjectFilter.includes(item.projectId);
    return matchesPDT && matchesProject;
  });

  // Get backlog items for inline display - apply PDT and Project filters
  const backlogItems = workItems.filter(item => {
    const isInBacklog = item.isInBacklog;
    const matchesPDT = selectedPDTFilter.length === 0 || selectedPDTFilter.includes(item.pdtTeamId);
    const matchesProject = selectedProjectFilter.length === 0 || selectedProjectFilter.includes(item.projectId);
    return isInBacklog && matchesPDT && matchesProject;
  });

  // Group work items by project
  const projectGroups = projects
    .sort((a, b) => b.priority - a.priority)
    .map(project => ({
      project,
      items: sortWorkItemsByPDTAndRow(
        getWorkItemsByProject(filteredWorkItems, project.id)
          .filter(item => !item.isInBacklog)
      )
    }))
    .filter(group => group.items.length > 0 || backlogItems.some(item => item.projectId === group.project.id));

  // Calculate dimensions
  const weekWidth = 80; // Match capacity table week width
  const barHeight = 40;
  const itemSpacing = 10;
  const backlogColumnWidth = 300; // Match PDT Team (200px) + Max Capacity (100px) columns
  
  const totalWidth = weeks.length * weekWidth; // Full width for timeline
  const viewportWidth = Math.max(1200, window.innerWidth - 100); // Responsive width
  
  // Function to calculate consistent project height for both timeline and backlog
  const calculateProjectHeight = (projectId: string) => {
    const isExpanded = expandedProjects.has(projectId);
    const projectItems = getWorkItemsByProject(filteredWorkItems, projectId)
      .filter(item => !item.isInBacklog);
    const projectBacklogItems = backlogItems.filter(item => item.projectId === projectId);
    
    let projectHeight = 50; // Base header height
    
    if (isExpanded) {
      const sortedItems = sortWorkItemsByPDTAndRow(projectItems);
      const pdtGroups: { [pdtTeamId: string]: WorkItem[] } = {};
      
      sortedItems.forEach(workItem => {
        if (!workItem.startDate || !workItem.endDate) return;
        if (!pdtGroups[workItem.pdtTeamId]) {
          pdtGroups[workItem.pdtTeamId] = [];
        }
        pdtGroups[workItem.pdtTeamId].push(workItem);
      });
      
      let totalWorkItems = 0;
      Object.keys(pdtGroups).forEach(pdtTeamId => {
        const pdtItems = pdtGroups[pdtTeamId];
        totalWorkItems += pdtItems.length;
      });
      
      // Add height for timeline work items
      projectHeight += totalWorkItems * (barHeight + itemSpacing) + 20;
    } else {
      // Collapsed project - check if there are timeline items to show info
      const hasTimelineInfo = projectItems.some(item => item.startDate && item.endDate);
      if (hasTimelineInfo) {
        projectHeight = 70; // Extra height for timeline info
      }
    }
    
    // Add height for backlog items (if any) - but only when expanded
    // When collapsed, backlog items don't affect the timeline height
    if (isExpanded && projectBacklogItems.length > 0) {
      projectHeight += projectBacklogItems.length * 60 + 10; // 60px per backlog item + padding
    }
    
    return projectHeight;
  };
  
  // Function to calculate backlog height (always includes backlog items)
  const calculateBacklogHeight = (projectId: string) => {
    const isExpanded = expandedProjects.has(projectId);
    const projectItems = getWorkItemsByProject(filteredWorkItems, projectId)
      .filter(item => !item.isInBacklog);
    const projectBacklogItems = backlogItems.filter(item => item.projectId === projectId);
    
    let projectHeight = 50; // Base header height
    
    if (isExpanded) {
      const sortedItems = sortWorkItemsByPDTAndRow(projectItems);
      const pdtGroups: { [pdtTeamId: string]: WorkItem[] } = {};
      
      sortedItems.forEach(workItem => {
        if (!workItem.startDate || !workItem.endDate) return;
        if (!pdtGroups[workItem.pdtTeamId]) {
          pdtGroups[workItem.pdtTeamId] = [];
        }
        pdtGroups[workItem.pdtTeamId].push(workItem);
      });
      
      let totalWorkItems = 0;
      Object.keys(pdtGroups).forEach(pdtTeamId => {
        const pdtItems = pdtGroups[pdtTeamId];
        totalWorkItems += pdtItems.length;
      });
      
      // Add height for timeline work items
      projectHeight += totalWorkItems * (barHeight + itemSpacing) + 20;
    } else {
      // Collapsed project - check if there are timeline items to show info
      const hasTimelineInfo = projectItems.some(item => item.startDate && item.endDate);
      if (hasTimelineInfo) {
        projectHeight = 70; // Extra height for timeline info
      }
    }
    
    // Add height for backlog items only when expanded (same as timeline)
    if (isExpanded && projectBacklogItems.length > 0) {
      projectHeight += projectBacklogItems.length * 60 + 10; // 60px per backlog item + padding
    }
    
    return projectHeight;
  };
  
  const totalHeight = projectGroups.reduce((height, group) => {
    return height + calculateProjectHeight(group.project.id) + 10; // Add spacing between projects
  }, 100); // Start with 100px for header

  useEffect(() => {
    if (svgRef.current) {
      // SVG dimensions are handled by the width and height props
    }
  }, [totalWidth, totalHeight]);

  const handleDragStart = (e: React.DragEvent | React.MouseEvent, workItem: WorkItem) => {
    setDraggedItem(workItem);
    
    // If it's a mouse event (timeline items), start 2-second hold timer
    if (e.type === 'mousedown') {
      const mouseEvent = e as React.MouseEvent;
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      
      // Start 2-second timer for hold-to-drag
      const timeout = window.setTimeout(() => {
        // Remove item from timeline and create ghost
        setGhostItem({ workItem, x: mouseEvent.clientX, y: mouseEvent.clientY });
        setDraggedItem(null); // Remove from timeline
        
        // Add visual feedback
        document.body.style.cursor = 'grabbing';
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
          setGhostItem(prev => prev ? { ...prev, x: moveEvent.clientX, y: moveEvent.clientY } : null);
        };
        
        const handleMouseUp = (dropEvent: MouseEvent) => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
          document.body.style.cursor = '';
          
          // Restore text selection
          document.body.style.userSelect = '';
          (document.body.style as any).webkitUserSelect = '';
          (document.body.style as any).mozUserSelect = '';
          (document.body.style as any).msUserSelect = '';
          
          // Handle drop using the current mouse position
          const containerRect = containerRef.current?.getBoundingClientRect();
          if (containerRect) {
            const x = dropEvent.clientX - containerRect.left + (containerRef.current?.scrollLeft || 0);
            
            // Since containerRef is the timeline area (after backlog), we don't need to subtract backlog width
            const weekIndex = Math.floor(x / weekWidth);
            
            if (weekIndex >= 0 && weekIndex < weeks.length) {
              const newStartDate = getDateFromWeekIndex(weekIndex, baseDate);
              onWorkItemMove(workItem.id, newStartDate);
            }
          }
          
          setGhostItem(null);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }, 2000); // 2 seconds
      
      setDragTimeout(timeout);
      
      // Add mouse up handler to cancel drag if released before 2 seconds
      const handleMouseUp = () => {
        if (dragTimeout) {
          clearTimeout(dragTimeout);
          setDragTimeout(null);
        }
        setDraggedItem(null);
        
        // Restore text selection
        document.body.style.userSelect = '';
        (document.body.style as any).webkitUserSelect = '';
        (document.body.style as any).mozUserSelect = '';
        (document.body.style as any).msUserSelect = '';
      };
      
      document.addEventListener('mouseup', handleMouseUp, { once: true });
      return;
    }
    
    // If it's a drag event (backlog items), use HTML5 drag and drop
    const dragEvent = e as React.DragEvent;
    try {
      dragEvent.dataTransfer.setData('text/plain', workItem.id);
      dragEvent.dataTransfer.effectAllowed = 'move';
    } catch (error) {
      console.warn('Could not set drag data:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem) return;

    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;
    
    // For HTML5 drag and drop (backlog items), we don't have the click offset
    // so we'll center the work item on the drop position
    const x = e.clientX - containerRect.left + (containerRef.current?.scrollLeft || 0);
    
    // Calculate precise position within the week
    const timelineX = x - backlogColumnWidth;
    const weekIndex = Math.floor(timelineX / weekWidth);
    const weekOffset = (timelineX % weekWidth) / weekWidth; // 0-1 fraction of the week
    
    // Check if drop is in the timeline area (not in backlog area) and within valid weeks
    // Also prevent dropping beyond the timeline bounds
    if (x > backlogColumnWidth && weekIndex >= 0 && weekIndex < weeks.length) {
      // Calculate the precise date within the week
      const weekStart = getDateFromWeekIndex(weekIndex, baseDate);
      const daysOffset = Math.floor(weekOffset * 7); // Convert fraction to days
      const newStartDate = new Date(weekStart);
      newStartDate.setDate(weekStart.getDate() + daysOffset);
      
      onWorkItemMove(draggedItem.id, newStartDate);
    }
    
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };





  const getPDTTeam = (pdtTeamId: string) => {
    return pdtTeams.find(team => team.id === pdtTeamId);
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };



  // Auto-scroll to current date on component mount only
  useEffect(() => {
    if (containerRef.current) {
      const currentDate = new Date();
      const currentWeekIndex = getWeekIndex(currentDate, baseDate);
      
      if (currentWeekIndex >= 0 && currentWeekIndex < weeks.length) {
        const scrollX = currentWeekIndex * weekWidth - (viewportWidth - backlogColumnWidth) / 2;
        containerRef.current.scrollTo({
          left: Math.max(0, scrollX),
          behavior: 'smooth'
        });
      }
    }
  }, []); // Only run on mount

  // Cleanup dragging state on unmount
  useEffect(() => {
    return () => {
      setDraggedItem(null);
      setGhostItem(null);
      if (dragTimeout) {
        clearTimeout(dragTimeout);
      }
    };
  }, [dragTimeout]);





  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Project Roadmap</h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedPDTFilter.length > 0 || selectedProjectFilter.length > 0
                ? `Filtered by: ${[
                    ...selectedPDTFilter.map(id => getPDTTeam(id)?.name),
                    ...selectedProjectFilter.map(id => projects.find(p => p.id === id)?.name)
                  ].filter(Boolean).join(', ')}`
                : 'All teams and projects'
              }
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4">
            {/* PDT Filter Multi-Select */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Filter by PDT:
              </label>
              <div className="relative" data-filter-dropdown>
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className="flex items-center justify-between w-48 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <span className="truncate">
                    {selectedPDTFilter.length === 0 
                      ? 'All PDT Teams' 
                      : selectedPDTFilter.length === 1
                      ? pdtTeams.find(t => t.id === selectedPDTFilter[0])?.name
                      : `${selectedPDTFilter.length} teams selected`
                    }
                  </span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isFilterDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <label className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPDTFilter.length === 0}
                          onChange={() => onPDTFilterChange([])}
                          className="mr-2"
                        />
                        <span className="text-sm">All PDT Teams</span>
                      </label>
                      {pdtTeams.map((team) => (
                        <label key={team.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPDTFilter.includes(team.id)}
                            onChange={() => {
                              if (selectedPDTFilter.includes(team.id)) {
                                onPDTFilterChange(selectedPDTFilter.filter(id => id !== team.id));
                              } else {
                                onPDTFilterChange([...selectedPDTFilter, team.id]);
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{team.name}</span>
                        </label>
                      ))}
                      {(selectedPDTFilter.length > 0) && (
                        <div className="border-t border-gray-200 mt-2 pt-2">
                          <button
                            onClick={() => onPDTFilterChange([])}
                            className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            Clear Filter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Project Filter Multi-Select */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Filter by Project:
              </label>
              <div className="relative" data-project-filter-dropdown>
                <button
                  onClick={() => setIsProjectFilterDropdownOpen(!isProjectFilterDropdownOpen)}
                  className="flex items-center justify-between w-48 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <span className="truncate">
                    {selectedProjectFilter.length === 0 
                      ? 'All Projects' 
                      : selectedProjectFilter.length === 1
                      ? projects.find(p => p.id === selectedProjectFilter[0])?.name
                      : `${selectedProjectFilter.length} projects selected`
                    }
                  </span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isProjectFilterDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <label className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedProjectFilter.length === 0}
                          onChange={() => onProjectFilterChange([])}
                          className="mr-2"
                        />
                        <span className="text-sm">All Projects</span>
                      </label>
                      {projects.map((project) => (
                        <label key={project.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedProjectFilter.includes(project.id)}
                            onChange={() => {
                              if (selectedProjectFilter.includes(project.id)) {
                                onProjectFilterChange(selectedProjectFilter.filter(id => id !== project.id));
                              } else {
                                onProjectFilterChange([...selectedProjectFilter, project.id]);
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{project.name}</span>
                        </label>
                      ))}
                      {(selectedProjectFilter.length > 0) && (
                        <div className="border-t border-gray-200 mt-2 pt-2">
                          <button
                            onClick={() => onProjectFilterChange([])}
                            className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            Clear Filter
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Go to Today's Date Button */}
            <button
              onClick={() => {
                if (containerRef.current) {
                  const currentDate = new Date();
                  const currentWeekIndex = getWeekIndex(currentDate, baseDate);
                  
                  if (currentWeekIndex >= 0 && currentWeekIndex < weeks.length) {
                    const scrollX = currentWeekIndex * weekWidth - (viewportWidth - backlogColumnWidth) / 2;
                    containerRef.current.scrollTo({
                      left: Math.max(0, scrollX),
                      behavior: 'smooth'
                    });
                  }
                }
              }}
              className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Go to Today
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex">
        {/* Fixed Backlog Column */}
        <div 
          className="sticky left-0 z-30 bg-white border-r border-gray-200"
          style={{ width: `${backlogColumnWidth}px`, minWidth: `${backlogColumnWidth}px` }}
        >
          {/* Backlog header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50" style={{ height: '80px', display: 'flex', alignItems: 'center' }}>
            <h4 className="text-sm font-semibold text-gray-900">Backlog</h4>
          </div>
          
          {/* Backlog content */}
          <div className="overflow-y-auto relative" style={{ height: `${totalHeight - 80}px` }}>
            {(() => {
              let currentBacklogY = 0;
              
              return projectGroups.map((group) => {
                const projectBacklogItems = backlogItems.filter(item => item.projectId === group.project.id);
                const isExpanded = expandedProjects.has(group.project.id);
                
                // Use the backlog height calculation function (always includes backlog items)
                const projectHeight = calculateBacklogHeight(group.project.id);
                
                const backlogY = currentBacklogY;
                currentBacklogY += projectHeight + 10; // Match timeline spacing
                
                return (
                  <div 
                    key={`backlog-${group.project.id}`} 
                    className="border-b border-gray-100"
                    style={{ 
                      position: 'absolute',
                      top: `${backlogY}px`,
                      left: '0',
                      right: '0',
                      height: `${projectHeight}px`
                    }}
                  >
                    {/* Project backlog header */}
                    <div 
                      className="px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleProjectExpansion(group.project.id)}
                      style={{ height: '50px', display: 'flex', alignItems: 'center' }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{group.project.name}</div>
                          <div className="text-xs text-gray-500">
                            {projectBacklogItems.length} item{projectBacklogItems.length !== 1 ? 's' : ''} in backlog
                          </div>
                        </div>
                        <div className="text-gray-400">
                          {isExpanded ? '−' : '+'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Backlog items - only show if expanded */}
                    {isExpanded && projectBacklogItems.length > 0 && (
                      <div className="px-4 pb-2">
                        {projectBacklogItems.map((workItem) => {
                          // Hide the backlog item if it's being dragged as a ghost
                          if (ghostItem && ghostItem.workItem.id === workItem.id) {
                            return null;
                          }
                          
                          const pdtTeam = getPDTTeam(workItem.pdtTeamId);
                          const hasBacklogCompletion = workItem.isInBacklog && workItem.completedPercentage > 0;
                          const hasDependencyConflict = checkDependencyConflict(workItem, workItems);
                          const hasAlert = hasBacklogCompletion || hasDependencyConflict;
                          
                          return (
                            <div 
                              key={workItem.id}
                              className={`mb-2 p-2 rounded border transition-colors relative ${
                                hasAlert 
                                  ? 'bg-red-50 border-red-300 hover:bg-red-100' 
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                              onMouseDown={(e) => {
                                // Start 2-second timer for hold-to-drag
                                e.preventDefault();
                                e.stopPropagation();
                                
                                // Prevent text selection
                                document.body.style.userSelect = 'none';
                                (document.body.style as any).webkitUserSelect = 'none';
                                (document.body.style as any).mozUserSelect = 'none';
                                (document.body.style as any).msUserSelect = 'none';
                                
                                const timeout = window.setTimeout(() => {
                                  // Create ghost item for backlog items
                                  setGhostItem({ workItem, x: e.clientX, y: e.clientY });
                                  
                                  // Add visual feedback
                                  document.body.style.cursor = 'grabbing';
                                  
                                  const handleMouseMove = (moveEvent: MouseEvent) => {
                                    setGhostItem(prev => prev ? { ...prev, x: moveEvent.clientX, y: moveEvent.clientY } : null);
                                  };
                                  
                                  const handleMouseUp = (dropEvent: MouseEvent) => {
                                    document.removeEventListener('mousemove', handleMouseMove);
                                    document.removeEventListener('mouseup', handleMouseUp);
                                    document.body.style.cursor = '';
                                    
                                    // Restore text selection
                                    document.body.style.userSelect = '';
                                    (document.body.style as any).webkitUserSelect = '';
                                    (document.body.style as any).mozUserSelect = '';
                                    (document.body.style as any).msUserSelect = '';
                                    
                                    // Handle drop using the current mouse position
                                    const containerRect = containerRef.current?.getBoundingClientRect();
                                    if (containerRect) {
                                      const x = dropEvent.clientX - containerRect.left + (containerRef.current?.scrollLeft || 0);
                                      
                                      // Since containerRef is the timeline area (after backlog), we don't need to subtract backlog width
                                      const weekIndex = Math.floor(x / weekWidth);
                                      
                                      if (weekIndex >= 0 && weekIndex < weeks.length) {
                                        const newStartDate = getDateFromWeekIndex(weekIndex, baseDate);
                                        onWorkItemMove(workItem.id, newStartDate);
                                      }
                                    }
                                    
                                    setGhostItem(null);
                                  };
                                  
                                  document.addEventListener('mousemove', handleMouseMove);
                                  document.addEventListener('mouseup', handleMouseUp);
                                }, 2000); // 2 seconds
                                
                                // Store timeout reference
                                (e.target as any).dragTimeout = timeout;
                              }}
                              onMouseUp={(e) => {
                                // Cancel drag if released before 2 seconds
                                if ((e.target as any).dragTimeout) {
                                  clearTimeout((e.target as any).dragTimeout);
                                  (e.target as any).dragTimeout = null;
                                }
                                
                                // Restore text selection
                                document.body.style.userSelect = '';
                                (document.body.style as any).webkitUserSelect = '';
                                (document.body.style as any).mozUserSelect = '';
                                (document.body.style as any).msUserSelect = '';
                              }}
                              onClick={(e) => {
                                // Clear any pending drag timeout
                                if ((e.target as any).dragTimeout) {
                                  clearTimeout((e.target as any).dragTimeout);
                                  (e.target as any).dragTimeout = null;
                                }
                                
                                // Always edit the work item on click (alert popup is handled by icon click)
                                onEdit(workItem);
                              }}
                            >
                              <div className="text-xs font-medium text-gray-900 truncate">{workItem.name}</div>
                              <div className="text-xs text-gray-500">
                                {pdtTeam?.name} • {workItem.duration}w • {workItem.capacity}%
                              </div>
                              
                              {/* Alert indicator */}
                              {hasAlert && (
                                <button 
                                  type="button"
                                  className="absolute top-1 right-1 text-red-500 text-xs cursor-pointer bg-transparent border-none p-0" 
                                  data-alert-icon
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                    setOpenBacklogPopover(openBacklogPopover === workItem.id ? null : workItem.id);
                                  }}
                                >
                                  ⚠️
                                </button>
                              )}
                              
                              {/* Alert dropdown */}
                              {hasAlert && openBacklogPopover === workItem.id && (
                                <div 
                                  className="absolute top-full right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-[9999] min-w-64 max-w-xs"
                                  data-alert-popover
                                  style={{ 
                                    position: 'absolute',
                                    top: '100%',
                                    right: '0',
                                    marginTop: '4px',
                                    backgroundColor: 'white',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    zIndex: 9999,
                                    minWidth: '256px',
                                    maxWidth: '320px'
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.nativeEvent.stopImmediatePropagation();
                                  }}
                                >
                                  <div className="p-3">
                                    <div className="flex items-center mb-2">
                                      <span className="text-red-500 mr-2 text-sm">⚠️</span>
                                      <span className="font-semibold text-gray-900 text-sm">Issue Detected</span>
                                    </div>
                                    
                                    {hasBacklogCompletion && (
                                      <div className="text-red-600 mb-3 text-sm">
                                        Backlog item shouldn't have completion percentage ({workItem.completedPercentage}%)
                                      </div>
                                    )}
                                    
                                    {hasDependencyConflict && (
                                      <div className="text-red-600 mb-3 text-sm">
                                        <div className="mb-2">Dependency on: {getDependencyConflictDetails(workItem, workItems).join(', ')}</div>
                                        <button
                                          type="button"
                                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            e.nativeEvent.stopImmediatePropagation();
                                            // Acknowledge all unacknowledged dependencies
                                            workItem.dependencies.forEach(depId => {
                                              if (!workItem.acknowledgedDependencies?.includes(depId)) {
                                                onAcknowledgeDependency(workItem.id, depId);
                                              }
                                            });
                                            setOpenBacklogPopover(null);
                                          }}
                                        >
                                          Acknowledge
                                        </button>
                                      </div>
                                    )}
                                    
                                    <div className="text-xs text-gray-500 text-center">
                                      Click outside to close
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </div>
        
        {/* Scrollable Timeline Area */}
        <div 
          ref={containerRef}
          className="overflow-auto relative flex-1" 
          style={{ maxWidth: `${viewportWidth - backlogColumnWidth}px` }}
        >
                {/* Sticky week headers */}
        <div 
          className="sticky top-0 z-20 bg-white border-b border-gray-200"
          style={{ 
            width: `${totalWidth}px`,
            minWidth: `${totalWidth}px`,
            height: '80px'
          }}
        >
          <svg
            width={totalWidth}
            height={80}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            {/* Week headers */}
            <g className="week-headers">
              {weeks.map((week, index) => (
                <g key={index} transform={`translate(${index * weekWidth}, 0)`}>
                  <rect
                    width={weekWidth}
                    height={80}
                    fill="#f9fafb"
                    stroke="#e5e7eb"
                  />
                  <text
                    x={weekWidth / 2}
                    y={30}
                    textAnchor="middle"
                    fontSize={12}
                    fill="#374151"
                    className="font-medium"
                  >
                    {week.label}
                  </text>
                  <text
                    x={weekWidth / 2}
                    y={50}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#6b7280"
                  >
                    {week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </text>
                </g>
              ))}
            </g>
            
            {/* Current date line in header */}
            {(() => {
              const currentDate = new Date();
              const currentWeekIndex = getWeekIndex(currentDate, baseDate);
              
              if (currentWeekIndex >= 0 && currentWeekIndex < weeks.length) {
                const lineX = currentWeekIndex * weekWidth + weekWidth / 2;
                return (
                  <line
                    x1={lineX}
                    y1={0}
                    x2={lineX}
                    y2={80}
                    stroke="#22c55e"
                    strokeWidth={2}
                    opacity={0.6}
                    strokeDasharray="4"
                  />
                );
              }
              return null;
            })()}
          </svg>
        </div>

        {/* Main timeline content */}
        <svg
          ref={svgRef}
          width={totalWidth}
          height={totalHeight - 80}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{ fontFamily: 'Inter, system-ui, sans-serif', minWidth: `${totalWidth}px` }}
          className="drop-zone"
        >
          
                      {/* Current date line in main content */}
            {(() => {
              const currentDate = new Date();
              const currentWeekIndex = getWeekIndex(currentDate, baseDate);
              
              if (currentWeekIndex >= 0 && currentWeekIndex < weeks.length) {
                const lineX = currentWeekIndex * weekWidth + weekWidth / 2;
                return (
                  <line
                    x1={lineX}
                    y1={0}
                    x2={lineX}
                    y2={totalHeight - 80}
                    stroke="#22c55e"
                    strokeWidth={2}
                    opacity={0.6}
                    strokeDasharray="4"
                  />
                );
              }
              return null;
            })()}
            
            {/* Project groups and work items */}
            <g className="project-groups">
            {(() => {
              let currentY = 10; // Add top margin for the first project
              
              return projectGroups.map((group) => {
                const isExpanded = expandedProjects.has(group.project.id);
                const projectItems = getWorkItemsByProject(filteredWorkItems, group.project.id)
                  .filter(item => !item.isInBacklog);
                
                // Use the same height calculation function for consistency
                const projectHeight = calculateProjectHeight(group.project.id);
                
                const projectY = currentY;
                currentY += projectHeight + 10; // Add spacing between projects
                
                // Calculate project timeline span
                const itemsWithDates = projectItems.filter(item => item.startDate && item.endDate);
                let projectStartWeek = 0;
                let projectEndWeek = 0;
                let projectDuration = 0;
                
                if (itemsWithDates.length > 0) {
                  const startDates = itemsWithDates.map(item => item.startDate!);
                  const endDates = itemsWithDates.map(item => item.endDate!);
                  const projectStartDate = new Date(Math.min(...startDates.map(d => d.getTime())));
                  const projectEndDate = new Date(Math.max(...endDates.map(d => d.getTime())));
                  
                  projectStartWeek = getWeekIndex(projectStartDate, baseDate);
                  projectEndWeek = getWeekIndex(projectEndDate, baseDate);
                  projectDuration = projectEndWeek - projectStartWeek + 1;
                }
                
                return (
                  <g key={group.project.id}>
                    {/* Project bar that spans the timeline */}
                    {itemsWithDates.length > 0 && (
                      <g transform={`translate(${projectStartWeek * weekWidth}, ${projectY})`}>
                        {/* Project background bar */}
                        <rect
                          width={projectDuration * weekWidth}
                          height={isExpanded ? projectHeight : 40}
                          fill={group.project.color}
                          opacity={0.1}
                          rx={4}
                          className="cursor-pointer hover:opacity-20 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProjectExpansion(group.project.id);
                          }}
                        />
                        
                        {/* Project name and info */}
                        <text
                          x={10}
                          y={20}
                          fontSize={14}
                          fill="#374151"
                          className="font-semibold cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProjectExpansion(group.project.id);
                          }}
                        >
                          {group.project.name}
                        </text>
                        <text
                          x={10}
                          y={35}
                          fontSize={10}
                          fill="#6b7280"
                        >
                          Priority: {group.project.priority} • {projectItems.length} items
                        </text>
                        
                        {/* Expand/collapse icon */}
                        <g
                          transform={`translate(${projectDuration * weekWidth - 30}, 12)`}
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleProjectExpansion(group.project.id);
                          }}
                        >
                          {isExpanded ? (
                            <path
                              d="M6 9l6 6 6-6"
                              stroke="#6b7280"
                              strokeWidth="2"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          ) : (
                            <path
                              d="M9 6l6 6-6 6"
                              stroke="#6b7280"
                              strokeWidth="2"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}
                        </g>
                      </g>
                    )}
                    
                                        {/* Work items - only show if expanded */}
                    {isExpanded && (() => {
                      const sortedItems = sortWorkItemsByPDTAndRow(projectItems);
                      
                      // Group by PDT team for positioning
                      const pdtGroups: { [pdtTeamId: string]: WorkItem[] } = {};
                      
                      sortedItems.forEach(workItem => {
                        if (!workItem.startDate || !workItem.endDate) return;
                        
                        if (!pdtGroups[workItem.pdtTeamId]) {
                          pdtGroups[workItem.pdtTeamId] = [];
                        }
                        pdtGroups[workItem.pdtTeamId].push(workItem);
                      });
                      
                      // Calculate row positions for each PDT team
                      const pdtRows: { [pdtTeamId: string]: WorkItem[][] } = {};
                      
                      Object.keys(pdtGroups).forEach(pdtTeamId => {
                        const pdtItems = pdtGroups[pdtTeamId];
                        const rows: WorkItem[][] = [];
                        
                        pdtItems.forEach(workItem => {
                          if (!workItem.startDate || !workItem.endDate) return;
                          
                          let rowIndex = 0;
                          while (rowIndex < rows.length) {
                            const row = rows[rowIndex];
                            const hasOverlap = row.some(existingItem => {
                              if (!existingItem.startDate || !existingItem.endDate) return false;
                              return (
                                (workItem.startDate! <= existingItem.endDate! && 
                                 workItem.endDate! >= existingItem.startDate!)
                              );
                            });
                            
                            if (!hasOverlap) break;
                            rowIndex++;
                          }
                          
                          if (rowIndex >= rows.length) {
                            rows.push([]);
                          }
                          rows[rowIndex].push(workItem);
                        });
                        
                        pdtRows[pdtTeamId] = rows;
                      });
                      
                      // Render work items - each item gets its own row
                      let globalRowIndex = 0;
                      return sortedItems.map(workItem => {
                            const pdtTeam = getPDTTeam(workItem.pdtTeamId);
                            if (!workItem.startDate || !workItem.endDate) return null;
                            
                            const startWeek = getWeekIndex(workItem.startDate, baseDate);
                            const endWeek = getWeekIndex(workItem.endDate, baseDate);
                            const startOffset = getWeekOffset(workItem.startDate);
                            const endOffset = getWeekOffset(workItem.endDate);
                            
                            // Calculate precise positioning within weeks
                            const x = (startWeek + startOffset) * weekWidth;
                            const y = projectY + 50 + globalRowIndex * (barHeight + itemSpacing);
                            
                            // Calculate precise width
                            let width;
                            if (startWeek === endWeek) {
                              // Same week - calculate partial width
                              width = (endOffset - startOffset) * weekWidth;
                            } else {
                              // Different weeks - calculate full weeks plus partial weeks
                              const fullWeeks = endWeek - startWeek - 1;
                              const startWeekWidth = (1 - startOffset) * weekWidth;
                              const endWeekWidth = endOffset * weekWidth;
                              width = startWeekWidth + (fullWeeks * weekWidth) + endWeekWidth;
                            }
                            
                            globalRowIndex++;
                            
                            // Hide the original TimelineBar if this work item is being dragged as a ghost
                            if (ghostItem && ghostItem.workItem.id === workItem.id) {
                              return null;
                            }
                            
                            return (
                              <TimelineBar
                                key={workItem.id}
                                workItem={workItem}
                                pdtTeam={pdtTeam!}
                                allWorkItems={workItems}
                                x={x}
                                y={y}
                                width={width}
                                height={barHeight}
                                onEdit={onEdit}
                                onDragStart={handleDragStart}
                                onAcknowledgeDependency={onAcknowledgeDependency}
                              />
                            );
                          });
                    })()}
                  </g>
                );
              });
            })()}
          </g>
        </svg>
        
        {/* Ghost Item for Drag and Drop */}
        {ghostItem && (() => {
          const workItem = ghostItem.workItem;
          if (!workItem.startDate || !workItem.endDate) return null;
          
          const startWeek = getWeekIndex(workItem.startDate, baseDate);
          const endWeek = getWeekIndex(workItem.endDate, baseDate);
          const startOffset = getWeekOffset(workItem.startDate);
          const endOffset = getWeekOffset(workItem.endDate);
          
          // Calculate precise width for ghost item
          let width;
          if (startWeek === endWeek) {
            // Same week - calculate partial width
            width = (endOffset - startOffset) * weekWidth;
          } else {
            // Different weeks - calculate full weeks plus partial weeks
            const fullWeeks = endWeek - startWeek - 1;
            const startWeekWidth = (1 - startOffset) * weekWidth;
            const endWeekWidth = endOffset * weekWidth;
            width = startWeekWidth + (fullWeeks * weekWidth) + endWeekWidth;
          }
          
          // Get PDT team for the work item
          const pdtTeam = getPDTTeam(workItem.pdtTeamId);
          
          // Calculate progress and colors (same as TimelineBar)
          const progressWidth = (workItem.completedPercentage / 100) * width;
          const progressColor = workItem.completedPercentage === 100 
            ? '#22c55e' 
            : workItem.completedPercentage > 50 
            ? '#3b82f6' 
            : '#f59e0b';
          
          // Check for alerts (same as TimelineBar)
          const hasDependencyConflict = checkDependencyConflict(workItem, workItems);
          const progressDelayDetails = getProgressDelayDetails(workItem);
          
          const currentDate = new Date();
          const isFutureWork = workItem.startDate && workItem.startDate > currentDate;
          const isPastWork = workItem.endDate && workItem.endDate < currentDate;
          const isCurrentWork = workItem.startDate && workItem.endDate && workItem.startDate <= currentDate && workItem.endDate >= currentDate;
          const isBacklogItem = workItem.isInBacklog;
          
          const hasFutureCompletion = isFutureWork && workItem.completedPercentage > 0;
          const hasBacklogCompletion = isBacklogItem && workItem.completedPercentage > 0;
          const hasPastIncomplete = isPastWork && workItem.completedPercentage < 100;
          const hasDelay = isCurrentWork && calculateProgressDelay(workItem);
          
          const hasAlert = hasDelay || hasDependencyConflict || hasFutureCompletion || hasBacklogCompletion || hasPastIncomplete;
          
          // Helper function to truncate text (same as TimelineBar)
          const truncateText = (text: string, maxWidth: number, fontSize: number = 12) => {
            const charWidth = fontSize * 0.55;
            const maxChars = Math.floor(maxWidth / charWidth);
            
            if (text.length <= maxChars) {
              return text;
            }
            
            const ellipsisChars = 3;
            const availableChars = Math.max(0, maxChars - ellipsisChars);
            
            if (availableChars <= 0) {
              return '...';
            }
            
            return text.substring(0, availableChars) + '...';
          };
          
          return (
            <svg
              className="fixed pointer-events-none z-50"
              style={{
                left: ghostItem.x,
                top: ghostItem.y - barHeight / 2,
                width: `${width}px`,
                height: `${barHeight}px`,
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
              {/* Background bar */}
              <rect
                width={width}
                height={barHeight}
                rx={4}
                fill="#f3f4f6"
                stroke="#d1d5db"
                strokeWidth={1}
                opacity={0.9}
              />
              
              {/* Progress fill */}
              <rect
                width={Math.max(progressWidth, 0)}
                height={barHeight}
                rx={4}
                fill={progressColor}
                opacity={0.8}
              />
              
              {/* Border for delayed items */}
              {hasDelay && (
                <rect
                  width={width}
                  height={barHeight}
                  rx={4}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4"
                />
              )}
              
              {/* Border for dependency conflicts */}
              {hasDependencyConflict && (
                <rect
                  width={width}
                  height={barHeight}
                  rx={4}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth={2}
                />
              )}
              
              {/* Border for past incomplete items */}
              {hasPastIncomplete && (
                <rect
                  width={width}
                  height={barHeight}
                  rx={4}
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth={2}
                  strokeDasharray="6"
                />
              )}
              
              {/* Text content */}
              <text
                x={hasAlert ? 25 : 8}
                y={barHeight / 2 + 4}
                fontSize={12}
                fill="#374151"
                className="font-medium"
              >
                {truncateText(workItem.name, width - (hasAlert ? 25 : 8) - 8, 12)}
              </text>
              
              {/* PDT Team name */}
              <text
                x={hasAlert ? 25 : 8}
                y={barHeight - 4}
                fontSize={10}
                fill="#6b7280"
              >
                {truncateText(`${pdtTeam?.name || 'Unknown'} • ${workItem.capacity}% • ${workItem.duration}w`, width - (hasAlert ? 25 : 8) - 8, 10)}
              </text>
              
              {/* Progress percentage */}
              <text
                x={width - 8}
                y={barHeight / 2 + 4}
                fontSize={11}
                fill="#374151"
                textAnchor="end"
                className="font-medium"
              >
                {truncateText(`${workItem.completedPercentage}%`, 40, 11)}
              </text>
              
              {/* Alert indicator */}
              {hasAlert && (
                <text
                  x={8}
                  y={barHeight / 2 + 4}
                  fontSize={12}
                  fill="#ef4444"
                  className="font-bold"
                >
                  ⚠️
                </text>
              )}
            </svg>
          );
        })()}
      </div>
    </div>
  </div>
  );
}; 