import React, { useState } from 'react';
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
  onDragStart: (e: React.DragEvent | React.MouseEvent, workItem: WorkItem) => void;
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
      transform={`translate(${x}, ${y})`}
      className="cursor-grab active:cursor-grabbing"
      onDoubleClick={() => onEdit(workItem)}
      onMouseDown={(e) => {
        // For timeline items, use mouse-based dragging
        if (workItem.startDate && workItem.endDate) {
          onDragStart(e as any, workItem);
        }
      }}
      onClick={(e) => {
        // Toggle popover on click if there are alerts
        if (hasAlert) {
          e.stopPropagation();
          setIsPopoverOpen(!isPopoverOpen);
        }
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
        >
          ⚠️
        </text>
      )}
      
      {/* Alert Popover */}
      {isPopoverOpen && hasAlert && (
        <g transform={`translate(0, ${height + 5})`}>
          {/* Popover background */}
          <rect
            x={-5}
            y={0}
            width={width + 10}
            height={hasDependencyConflict ? 120 : (hasDelay || hasFutureCompletion || hasPastIncomplete ? 80 : 60)}
            fill="#1f2937"
            rx={6}
            opacity={0.95}
          />
          
          {/* Popover border */}
          <rect
            x={-5}
            y={0}
            width={width + 10}
            height={hasDependencyConflict ? 120 : (hasDelay || hasFutureCompletion || hasPastIncomplete ? 80 : 60)}
            fill="none"
            stroke="#ef4444"
            strokeWidth={1}
            rx={6}
          />
          
          {/* Alert icon */}
          <text
            x={8}
            y={16}
            fontSize={12}
            fill="#ef4444"
            className="font-bold"
          >
            ⚠️
          </text>
          
          {/* Alert title */}
          <text
            x={25}
            y={16}
            fontSize={11}
            fill="#ffffff"
            className="font-semibold"
          >
            Issues Detected:
          </text>
          
          {/* Alert messages - dependency conflict always at bottom */}
          {hasDelay && (
            <text x={8} y={32} fontSize={10} fill="#fca5a5">
              • Behind schedule: currently {progressDelayDetails.currentProgress}% complete, expected {progressDelayDetails.expectedProgress}% complete
            </text>
          )}
          {hasFutureCompletion && (
            <text x={8} y={hasDelay ? 48 : 32} fontSize={10} fill="#fca5a5">
              • Future work item has completion percentage ({workItem.completedPercentage}%)
            </text>
          )}
          {hasPastIncomplete && (
            <text x={8} y={hasDelay || hasFutureCompletion ? 64 : 32} fontSize={10} fill="#fca5a5">
              • Past work should be 100% complete
            </text>
          )}
          {hasDependencyConflict && (
            <>
              <text x={8} y={hasDelay || hasFutureCompletion || hasPastIncomplete ? 80 : 32} fontSize={10} fill="#fca5a5">
                • Dependency on: {dependencyConflictDetails.join(', ')}
              </text>
              {/* Acknowledge button */}
              <rect
                x={8}
                y={92}
                width={80}
                height={20}
                fill="#22c55e"
                rx={4}
                className="cursor-pointer"
                onClick={() => {
                  // Acknowledge the first dependency conflict
                  const firstConflict = dependencyConflictDetails[0];
                  const conflictItem = allWorkItems.find(w => w.name === firstConflict);
                  if (conflictItem) {
                    onAcknowledgeDependency(workItem.id, conflictItem.id);
                  }
                }}
              />
              <text
                x={48}
                y={105}
                fontSize={9}
                fill="#ffffff"
                textAnchor="middle"
                className="cursor-pointer font-medium"
                onClick={() => {
                  const firstConflict = dependencyConflictDetails[0];
                  const conflictItem = allWorkItems.find(w => w.name === firstConflict);
                  if (conflictItem) {
                    onAcknowledgeDependency(workItem.id, conflictItem.id);
                  }
                }}
              >
                Acknowledge
              </text>
            </>
          )}
        </g>
      )}
    </g>
  );
}; 