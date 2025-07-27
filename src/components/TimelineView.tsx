import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { WorkItem, Project, PDTTeam } from '../types';
import { TimelineBar } from './TimelineBar';
import { getAllWeeksInYear, getWeekIndex, getDateFromWeekIndex } from '../utils/dateUtils';
import { getWorkItemsByProject, sortWorkItemsByPDTAndRow, checkDependencyConflict, getDependencyConflictDetails } from '../utils/calculations';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface TimelineViewProps {
  workItems: WorkItem[];
  projects: Project[];
  pdtTeams: PDTTeam[];
  selectedPDTFilter: string | null;
  onEdit: (workItem: WorkItem) => void;
  onWorkItemMove: (workItemId: string, newStartDate: Date) => void;
  onPDTFilterChange: (pdtTeamId: string | null) => void;
  onAcknowledgeDependency: (workItemId: string, dependencyId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  workItems,
  projects,
  pdtTeams,
  selectedPDTFilter,
  onEdit,
  onWorkItemMove,
  onPDTFilterChange,
  onAcknowledgeDependency
}) => {
  const [openBacklogPopover, setOpenBacklogPopover] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openBacklogPopover) {
        const target = event.target as Element;
        // Don't close if clicking on the alert icon or the popover itself
        if (target.closest('[data-alert-popover]') || target.closest('[data-alert-icon]')) {
          return;
        }
        setOpenBacklogPopover(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openBacklogPopover]);
  const [draggedItem, setDraggedItem] = useState<WorkItem | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());


  const weeks = getAllWeeksInYear(new Date().getFullYear()); // All 52 weeks of the year
  const baseDate = weeks[0].start; // First week as base date
  
  // Filter work items based on PDT filter
  const filteredWorkItems = selectedPDTFilter 
    ? workItems.filter(item => item.pdtTeamId === selectedPDTFilter)
    : workItems;

  // Get backlog items for inline display
  const backlogItems = workItems.filter(item => item.isInBacklog);

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
  const projectSpacing = 60;
  const itemSpacing = 10;
  const backlogHeight = 60; // Height for backlog section
  const backlogColumnWidth = 300; // Match PDT Team (200px) + Max Capacity (100px) columns
  
  const totalWidth = weeks.length * weekWidth; // Full width for timeline
  const viewportWidth = Math.max(1200, window.innerWidth - 100); // Responsive width
  const totalHeight = projectGroups.reduce((height, group) => {
    const isExpanded = expandedProjects.has(group.project.id);
    const projectItems = getWorkItemsByProject(filteredWorkItems, group.project.id)
      .filter(item => !item.isInBacklog);
    
                    if (!isExpanded) {
                  // Collapsed project - header height + timeline info
                  const hasTimelineInfo = projectItems.some(item => item.startDate && item.endDate);
                  return height + (hasTimelineInfo ? 70 : 50); // Extra height for timeline info
                }
    
    // Expanded project - calculate work item rows using PDT-based organization
    const sortedItems = sortWorkItemsByPDTAndRow(projectItems);
    
    // Group by PDT team to calculate rows
    const pdtGroups: { [pdtTeamId: string]: WorkItem[] } = {};
    
    sortedItems.forEach(workItem => {
      if (!workItem.startDate || !workItem.endDate) return;
      
      if (!pdtGroups[workItem.pdtTeamId]) {
        pdtGroups[workItem.pdtTeamId] = [];
      }
      pdtGroups[workItem.pdtTeamId].push(workItem);
    });
    
    // Count total work items (each gets its own row)
    let totalWorkItems = 0;
    Object.keys(pdtGroups).forEach(pdtTeamId => {
      const pdtItems = pdtGroups[pdtTeamId];
      totalWorkItems += pdtItems.length;
    });
    
    const projectHeight = 50 + (totalWorkItems * (barHeight + itemSpacing)) + 20; // Header + items + padding
    return height + projectHeight;
  }, 100) + backlogHeight; // Add space for backlog

  useEffect(() => {
    if (svgRef.current) {
      // SVG dimensions are handled by the width and height props
    }
  }, [totalWidth, totalHeight]);

  const handleDragStart = (e: React.DragEvent | React.MouseEvent, workItem: WorkItem) => {
    setDraggedItem(workItem);
    
    // If it's a mouse event (timeline items), start mouse-based dragging
    if (e.type === 'mousedown') {
      const mouseEvent = e as React.MouseEvent;
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
      
      const svg = svgRef.current;
      if (!svg) return;
      
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      
      // Add visual feedback
      document.body.style.cursor = 'grabbing';
      
      const handleMouseMove = (moveEvent: MouseEvent) => {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;
        
        // Calculate position relative to the scrollable container, accounting for scroll
        const x = moveEvent.clientX - containerRect.left + (containerRef.current?.scrollLeft || 0);
        const weekIndex = Math.floor((x - backlogColumnWidth) / weekWidth);
        
        if (x > backlogColumnWidth && weekIndex >= 0 && weekIndex < weeks.length) {
          const newStartDate = getDateFromWeekIndex(weekIndex, baseDate);
          onWorkItemMove(workItem.id, newStartDate);
        }
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        setDraggedItem(null);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
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
    
    // Calculate position relative to the scrollable container, accounting for scroll
    const x = e.clientX - containerRect.left + (containerRef.current?.scrollLeft || 0);
    const y = e.clientY - containerRect.top + (containerRef.current?.scrollTop || 0);
    
    // Calculate week index from x position (accounting for backlog column)
    const weekIndex = Math.floor((x - backlogColumnWidth) / weekWidth);
    
    // Check if drop is in the timeline area (not in backlog area) and within valid weeks
    if (x > backlogColumnWidth && weekIndex >= 0 && weekIndex < weeks.length) {
      const newStartDate = getDateFromWeekIndex(weekIndex, baseDate);
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



  // Auto-scroll to current date on component mount
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
  }, [baseDate, weeks.length, weekWidth, viewportWidth]);





  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Project Roadmap</h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedPDTFilter 
                ? `Filtered by: ${getPDTTeam(selectedPDTFilter)?.name}`
                : 'All PDT teams'
              }
            </p>
          </div>
          
          {/* PDT Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <label htmlFor="pdt-filter" className="text-sm font-medium text-gray-700">
              Filter by PDT:
            </label>
            <select
              id="pdt-filter"
              value={selectedPDTFilter || ''}
              onChange={(e) => onPDTFilterChange(e.target.value || null)}
              className="block w-48 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All PDT Teams</option>
              {pdtTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
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
                
                // Calculate project height to match timeline positioning
                const projectItems = getWorkItemsByProject(filteredWorkItems, group.project.id)
                  .filter(item => !item.isInBacklog);
                
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
                  
                  projectHeight += totalWorkItems * (barHeight + itemSpacing) + 20;
                }
                
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
                          const pdtTeam = getPDTTeam(workItem.pdtTeamId);
                          const hasBacklogCompletion = workItem.isInBacklog && workItem.completedPercentage > 0;
                          const hasDependencyConflict = checkDependencyConflict(workItem, workItems);
                          const hasAlert = hasBacklogCompletion || hasDependencyConflict;
                          
                          return (
                            <div 
                              key={workItem.id}
                              className={`mb-2 p-2 rounded border cursor-move transition-colors relative ${
                                hasAlert 
                                  ? 'bg-red-50 border-red-300 hover:bg-red-100' 
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, workItem)}
                              onDoubleClick={() => onEdit(workItem)}
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
                
                // Calculate project height - use same logic as total height calculation
                let projectHeight = 50; // Base header height
                
                if (isExpanded) {
                  // Use same logic as total height calculation
                  const sortedItems = sortWorkItemsByPDTAndRow(projectItems);
                  
                  // Group by PDT team to calculate rows
                  const pdtGroups: { [pdtTeamId: string]: WorkItem[] } = {};
                  
                  sortedItems.forEach(workItem => {
                    if (!workItem.startDate || !workItem.endDate) return;
                    
                    if (!pdtGroups[workItem.pdtTeamId]) {
                      pdtGroups[workItem.pdtTeamId] = [];
                    }
                    pdtGroups[workItem.pdtTeamId].push(workItem);
                  });
                  
                  // Count total work items (each gets its own row)
                  let totalWorkItems = 0;
                  Object.keys(pdtGroups).forEach(pdtTeamId => {
                    const pdtItems = pdtGroups[pdtTeamId];
                    totalWorkItems += pdtItems.length;
                  });
                  
                  projectHeight += totalWorkItems * (barHeight + itemSpacing) + 20; // Add work items height
                }
                
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
                          onClick={() => toggleProjectExpansion(group.project.id)}
                        />
                        
                        {/* Project name and info */}
                        <text
                          x={10}
                          y={20}
                          fontSize={14}
                          fill="#374151"
                          className="font-semibold cursor-pointer"
                          onClick={() => toggleProjectExpansion(group.project.id)}
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
                          onClick={() => toggleProjectExpansion(group.project.id)}
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
                            const duration = endWeek - startWeek + 1;
                            
                            const x = startWeek * weekWidth;
                            const y = projectY + 50 + globalRowIndex * (barHeight + itemSpacing);
                            const width = duration * weekWidth;
                            
                            globalRowIndex++;
                            
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
      </div>
    </div>
  </div>
  );
}; 