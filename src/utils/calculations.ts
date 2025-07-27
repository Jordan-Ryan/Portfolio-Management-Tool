import { differenceInWeeks, addWeeks } from 'date-fns';
import { WorkItem, PDTTeam, Alert, CapacityData } from '../types';

export const calculateProgressDelay = (workItem: WorkItem): boolean => {
  if (!workItem.startDate || !workItem.endDate) return false;
  
  const totalDuration = differenceInWeeks(workItem.endDate, workItem.startDate);
  const elapsedDuration = differenceInWeeks(new Date(), workItem.startDate);
  const expectedProgress = Math.min(100, (elapsedDuration / totalDuration) * 100);
  
  return workItem.completedPercentage < (expectedProgress - 20);
};

export const getProgressDelayDetails = (workItem: WorkItem): { isDelayed: boolean; currentProgress: number; expectedProgress: number } => {
  if (!workItem.startDate || !workItem.endDate) {
    return { isDelayed: false, currentProgress: 0, expectedProgress: 0 };
  }
  
  const totalDuration = differenceInWeeks(workItem.endDate, workItem.startDate);
  const elapsedDuration = differenceInWeeks(new Date(), workItem.startDate);
  const expectedProgress = Math.min(100, (elapsedDuration / totalDuration) * 100);
  const isDelayed = workItem.completedPercentage < (expectedProgress - 20);
  
  return {
    isDelayed,
    currentProgress: workItem.completedPercentage,
    expectedProgress: Math.round(expectedProgress)
  };
};

export const checkDependencyConflict = (workItem: WorkItem, allWorkItems: WorkItem[]): boolean => {
  if (!workItem.startDate || !workItem.endDate) return false;
  
  return workItem.dependencies.some(depId => {
    // Skip if this dependency has been acknowledged
    if (workItem.acknowledgedDependencies?.includes(depId)) return false;
    
    const predecessor = allWorkItems.find(w => w.id === depId);
    if (!predecessor || !predecessor.endDate) return false;
    
    return workItem.startDate! < predecessor.endDate;
  });
};

export const getDependencyConflictDetails = (workItem: WorkItem, allWorkItems: WorkItem[]): string[] => {
  if (!workItem.startDate || !workItem.endDate) return [];
  
  const conflicts: string[] = [];
  workItem.dependencies.forEach(depId => {
    // Skip if this dependency has been acknowledged
    if (workItem.acknowledgedDependencies?.includes(depId)) return;
    
    const predecessor = allWorkItems.find(w => w.id === depId);
    if (predecessor && predecessor.endDate && workItem.startDate! < predecessor.endDate) {
      conflicts.push(predecessor.name);
    }
  });
  
  return conflicts;
};

export const calculateCapacityForWeek = (
  pdtTeamId: string,
  weekIndex: number,
  workItems: WorkItem[],
  baseDate: Date
): CapacityData => {
  const weekStart = addWeeks(baseDate, weekIndex);
  const weekEnd = addWeeks(weekStart, 1);
  
  const capacityUsed = workItems
    .filter(item => 
      item.pdtTeamId === pdtTeamId &&
      item.startDate &&
      item.endDate &&
      item.startDate < weekEnd &&
      item.endDate > weekStart
    )
    .reduce((sum, item) => sum + item.capacity, 0);
  
  return {
    pdtTeamId,
    weekIndex,
    capacityUsed,
    percentage: 0 // Will be calculated with max capacity
  };
};

export const generateAlerts = (
  workItems: WorkItem[],
  pdtTeams: PDTTeam[]
): Alert[] => {
  const alerts: Alert[] = [];
  const currentDate = new Date();
  
  // Check for progress delays
  workItems.forEach(item => {
    if (calculateProgressDelay(item)) {
      alerts.push({
        id: `delay-${item.id}`,
        type: 'delay',
        workItemId: item.id,
        message: `Work item "${item.name}" is behind schedule`,
        severity: 'warning'
      });
    }
  });
  
  // Check for dependency conflicts
  workItems.forEach(item => {
    const conflictDetails = getDependencyConflictDetails(item, workItems);
    if (conflictDetails.length > 0) {
      alerts.push({
        id: `dependency-${item.id}`,
        type: 'dependency',
        workItemId: item.id,
        message: `Work item "${item.name}" has dependency on: ${conflictDetails.join(', ')}`,
        severity: 'error'
      });
    }
  });
  
  // Check for future work items with completion percentage
  workItems.forEach(item => {
    if (item.startDate && item.endDate && item.startDate > currentDate && item.completedPercentage > 0) {
      alerts.push({
        id: `future-completion-${item.id}`,
        type: 'delay',
        workItemId: item.id,
        message: `Future work item "${item.name}" has completion percentage (${item.completedPercentage}%)`,
        severity: 'warning'
      });
    }
  });
  
  // Check for backlog items with completion percentage
  workItems.forEach(item => {
    if (item.isInBacklog && item.completedPercentage > 0) {
      alerts.push({
        id: `backlog-completion-${item.id}`,
        type: 'delay',
        workItemId: item.id,
        message: `Backlog item "${item.name}" has completion percentage (${item.completedPercentage}%)`,
        severity: 'warning'
      });
    }
  });
  
  // Check for past work items not 100% complete
  workItems.forEach(item => {
    if (item.startDate && item.endDate && item.endDate < currentDate && item.completedPercentage < 100) {
      alerts.push({
        id: `past-incomplete-${item.id}`,
        type: 'delay',
        workItemId: item.id,
        message: `Past work item "${item.name}" is not 100% complete (${item.completedPercentage}%)`,
        severity: 'error'
      });
    }
  });
  
  // Check for capacity overflow
  const baseDate = new Date();
  for (let weekIndex = 0; weekIndex < 12; weekIndex++) {
    pdtTeams.forEach(team => {
      const capacityData = calculateCapacityForWeek(team.id, weekIndex, workItems, baseDate);
      const percentage = (capacityData.capacityUsed / team.maxCapacity) * 100;
      
      if (percentage > 100) {
        // Calculate the actual week of the year
        const weekDate = new Date(baseDate);
        weekDate.setDate(baseDate.getDate() + (weekIndex * 7));
        const weekOfYear = Math.ceil((weekDate.getTime() - new Date(weekDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        
        alerts.push({
          id: `capacity-${team.id}-${weekIndex}`,
          type: 'capacity',
          pdtTeamId: team.id,
          message: `${team.name} is over capacity (${percentage.toFixed(1)}%) in week ${weekOfYear}`,
          severity: 'error'
        });
      }
    });
  }
  
  return alerts;
};

export const getWorkItemsByProject = (workItems: WorkItem[], projectId: string) => {
  return workItems.filter(item => item.projectId === projectId);
};

export const getWorkItemsByPDT = (workItems: WorkItem[], pdtTeamId: string) => {
  return workItems.filter(item => item.pdtTeamId === pdtTeamId);
};

export const sortWorkItemsByStartDate = (workItems: WorkItem[]) => {
  return workItems.sort((a, b) => {
    if (!a.startDate && !b.startDate) return 0;
    if (!a.startDate) return 1;
    if (!b.startDate) return -1;
    return a.startDate.getTime() - b.startDate.getTime();
  });
};

export const sortWorkItemsByStartDateAndRow = (workItems: WorkItem[]) => {
  // First sort by start date
  const sortedByDate = sortWorkItemsByStartDate(workItems);
  
  // Then assign row positions to avoid overlaps
  const rows: WorkItem[][] = [];
  
  sortedByDate.forEach(workItem => {
    if (!workItem.startDate || !workItem.endDate) return;
    
    // Find the first available row
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
    
    // Create new row if needed
    if (rowIndex >= rows.length) {
      rows.push([]);
    }
    
    rows[rowIndex].push(workItem);
  });
  
  // Flatten rows back to array, maintaining row order
  return rows.flat();
};

export const sortWorkItemsByPDTAndRow = (workItems: WorkItem[]) => {
  // First sort by start date
  const sortedByDate = sortWorkItemsByStartDate(workItems);
  
  // Group by PDT team
  const pdtGroups: { [pdtTeamId: string]: WorkItem[] } = {};
  
  sortedByDate.forEach(workItem => {
    if (!workItem.startDate || !workItem.endDate) return;
    
    if (!pdtGroups[workItem.pdtTeamId]) {
      pdtGroups[workItem.pdtTeamId] = [];
    }
    pdtGroups[workItem.pdtTeamId].push(workItem);
  });
  
  // For each PDT team, organize items into rows to avoid overlaps
  const pdtRows: { [pdtTeamId: string]: WorkItem[][] } = {};
  
  Object.keys(pdtGroups).forEach(pdtTeamId => {
    const pdtItems = pdtGroups[pdtTeamId];
    const rows: WorkItem[][] = [];
    
    pdtItems.forEach(workItem => {
      if (!workItem.startDate || !workItem.endDate) return;
      
      // Find the first available row for this PDT
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
      
      // Create new row if needed
      if (rowIndex >= rows.length) {
        rows.push([]);
      }
      
      rows[rowIndex].push(workItem);
    });
    
    pdtRows[pdtTeamId] = rows;
  });
  
  // Flatten all PDT rows into a single array, maintaining PDT grouping
  const result: WorkItem[] = [];
  Object.keys(pdtRows).forEach(pdtTeamId => {
    pdtRows[pdtTeamId].forEach(row => {
      result.push(...row);
    });
  });
  
  return result;
}; 