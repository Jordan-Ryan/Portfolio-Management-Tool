import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { WorkItem, PDTTeam } from '../types';
import { calculateProgressDelay, checkDependencyConflict, getDependencyConflictDetails, getProgressDelayDetails } from '../utils/calculations';

interface TimelineBarProps {
  workItem: WorkItem;
  pdtTeam: PDTTeam;
  allWorkItems: WorkItem[];
  x: number;
  y: number;
  width: number;
  height: number;
  onEdit: (workItem: WorkItem) => void;
  onDragStart: (e: React.DragEvent | React.MouseEvent, workItem: WorkItem, workItemX?: number) => void;
  onAcknowledgeDependency: (workItemId: string, dependencyId: string) => void;
}

export const TimelineBar: React.FC<TimelineBarProps> = ({
  workItem,
  pdtTeam,
  allWorkItems,
  x,
  y,
  width,
  height,
  onEdit,
  onDragStart,
  onAcknowledgeDependency
}) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [dragTimeout, setDragTimeout] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const workItemRef = useRef<SVGGElement>(null);
  
  // Cleanup timeout on unmount and handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPopoverOpen && workItemRef.current && !workItemRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
        setPopupPosition(null);
      }
    };

    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      if (dragTimeout) {
        clearTimeout(dragTimeout);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dragTimeout, isPopoverOpen]);
  
  const hasDependencyConflict = checkDependencyConflict(workItem, allWorkItems);
  const dependencyConflictDetails = getDependencyConflictDetails(workItem, allWorkItems);
  const progressDelayDetails = getProgressDelayDetails(workItem);
  
  // Check for all alert types
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



  const progressWidth = (workItem.completedPercentage / 100) * width;
  const progressColor = workItem.completedPercentage === 100 
    ? '#22c55e' 
    : workItem.completedPercentage > 50 
    ? '#3b82f6' 
    : '#f59e0b';

  return (
    <g
      ref={workItemRef}
      transform={`translate(${x}, ${y})`}
      className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={(e) => {
        // Start drag delay timer
        if (workItem.startDate && workItem.endDate) {
          const timeout = window.setTimeout(() => {
            setIsDragging(true);
            onDragStart(e as any, workItem, x);
          }, 2000); // 2 second delay
          setDragTimeout(timeout);
        }
      }}
      onMouseUp={() => {
        // Clear drag timeout if mouse is released before delay
        if (dragTimeout) {
          clearTimeout(dragTimeout);
          setDragTimeout(null);
        }
        setIsDragging(false);
      }}
      onMouseLeave={() => {
        // Clear drag timeout if mouse leaves
        if (dragTimeout) {
          clearTimeout(dragTimeout);
          setDragTimeout(null);
        }
        setIsDragging(false);
      }}
      onClick={() => {
        // Clear any pending drag timeout
        if (dragTimeout) {
          clearTimeout(dragTimeout);
          setDragTimeout(null);
        }
        
        // Always edit the work item on click (alert popup is handled by icon click)
        onEdit(workItem);
      }}
    >
      {/* Background bar */}
      <rect
        width={width}
        height={height}
        rx={4}
        fill="#f3f4f6"
        stroke="#d1d5db"
        strokeWidth={1}
        className="transition-all duration-200 hover:stroke-gray-400 cursor-move"
      />
      
      {/* Progress fill */}
      <rect
        width={Math.max(progressWidth, 0)}
        height={height}
        rx={4}
        fill={progressColor}
        opacity={0.8}
      />
      
      {/* Border for delayed items */}
      {hasDelay && (
        <rect
          width={width}
          height={height}
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
          height={height}
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
          height={height}
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
        y={height / 2 + 4}
        fontSize={12}
        fill="#374151"
        className="font-medium"
      >
        {workItem.name}
      </text>
      
      {/* PDT Team name */}
      <text
        x={hasAlert ? 25 : 8}
        y={height - 4}
        fontSize={10}
        fill="#6b7280"
      >
        {pdtTeam.name} • {workItem.capacity}% • {workItem.duration}w
      </text>
      
      {/* Progress percentage */}
      <text
        x={width - 8}
        y={height / 2 + 4}
        fontSize={11}
        fill="#374151"
        textAnchor="end"
        className="font-medium"
      >
        {workItem.completedPercentage}%
      </text>
      
      {/* Alert indicator */}
      {hasAlert && (
        <text
          x={8}
          y={height / 2 + 4}
          fontSize={12}
          fill="#ef4444"
          className="font-bold cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (!isPopoverOpen) {
              // Calculate position for popup
              const rect = workItemRef.current?.getBoundingClientRect();
              if (rect) {
                const viewportHeight = window.innerHeight;
                const popupHeight = hasDependencyConflict ? 120 : (hasDelay || hasFutureCompletion || hasPastIncomplete ? 80 : 60);
                
                // Check if popup would go below viewport
                const wouldGoBelow = rect.bottom + popupHeight > viewportHeight;
                
                setPopupPosition({
                  x: rect.left,
                  y: wouldGoBelow ? rect.top - popupHeight - 5 : rect.bottom + 5
                });
              }
            }
            setIsPopoverOpen(!isPopoverOpen);
          }}
        >
          ⚠️
        </text>
      )}
      
      {/* Portal-based Alert Popover */}
      {isPopoverOpen && hasAlert && popupPosition && createPortal(
        <div
          className="fixed bg-gray-800 text-white rounded border border-red-500 p-2 text-xs shadow-lg"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            zIndex: 9999,
            minWidth: `${width + 10}px`,
            maxWidth: '300px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center mb-2">
            <span className="text-red-400 mr-2">⚠️</span>
            <span className="font-semibold">Issues Detected:</span>
          </div>
          
          {hasDelay && (
            <div className="text-red-300 mb-1">
              • Behind schedule: currently {progressDelayDetails.currentProgress}% complete, expected {progressDelayDetails.expectedProgress}% complete
            </div>
          )}
          
          {hasFutureCompletion && (
            <div className="text-red-300 mb-1">
              • Future work item has completion percentage ({workItem.completedPercentage}%)
            </div>
          )}
          
          {hasPastIncomplete && (
            <div className="text-red-300 mb-1">
              • Past work should be 100% complete
            </div>
          )}
          
          {hasDependencyConflict && (
            <div className="text-red-300 mb-2">
              <div className="mb-1">• Dependency on: {dependencyConflictDetails.join(', ')}</div>
              <button
                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                onClick={() => {
                  const firstConflict = dependencyConflictDetails[0];
                  const conflictItem = allWorkItems.find(w => w.name === firstConflict);
                  if (conflictItem) {
                    onAcknowledgeDependency(workItem.id, conflictItem.id);
                  }
                  setIsPopoverOpen(false);
                }}
              >
                Acknowledge
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </g>
  );
}; 