import React, { useRef, useEffect, useState } from 'react';
import { PDTTeam, WorkItem, CapacityData } from '../types';
import { calculateCapacityForWeek, getCapacityPercentage } from '../utils/calculations';
import { getAllWeeksInYear, getWeekIndex, getWorkWeekRange, getTodayPosition } from '../utils/dateUtils';

interface CapacityTableProps {
  pdtTeams: PDTTeam[];
  workItems: WorkItem[];
  selectedPDTFilter: string[];
  onPDTFilterChange: (pdtTeamIds: string[]) => void;
}

interface CapacityBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdtTeam: PDTTeam;
  weekIndex: number;
  workItems: WorkItem[];
  baseDate: Date;
}

const CapacityBreakdownModal: React.FC<CapacityBreakdownModalProps> = ({
  isOpen,
  onClose,
  pdtTeam,
  weekIndex,
  workItems,
  baseDate
}) => {
  if (!isOpen) return null;

  // Get work items for this PDT team and week
  const weekStart = new Date(baseDate);
  weekStart.setDate(weekStart.getDate() + (weekIndex * 7));
  
  // Use the same week boundaries as the table (getWorkWeekRange)
  const { start: workWeekStart, end: workWeekEnd } = getWorkWeekRange(weekStart);

  const relevantWorkItems = workItems.filter(item => 
    item.pdtTeamId === pdtTeam.id &&
    item.startDate &&
    item.endDate &&
    item.startDate <= workWeekEnd &&
    item.endDate >= workWeekStart
  );

  // Calculate breakdown for each work item
  const breakdownItems = relevantWorkItems.map(item => {
    // Normalize all dates to remove time components
    const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const normalizedStartDate = normalizeDate(item.startDate!);
    const normalizedEndDate = normalizeDate(item.endDate!);
    const normalizedWeekStart = normalizeDate(workWeekStart);
    const normalizedWeekEnd = normalizeDate(workWeekEnd);

    // Use the same overlap calculation as the table
    const overlapStart = new Date(Math.max(normalizedStartDate.getTime(), normalizedWeekStart.getTime()));
    const overlapEnd = new Date(Math.min(normalizedEndDate.getTime(), normalizedWeekEnd.getTime()));

    // Count work days in overlap (Monday-Friday only)
    let workDays = 0;
    const currentDate = new Date(overlapStart);
    
    // Use inclusive comparison - include both start and end dates
    while (currentDate <= overlapEnd) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Clamp to max 5
    workDays = Math.min(workDays, 5);
    const capacityForWeek = (item.capacity / 5) * workDays;
    return {
      workItem: item,
      workDays,
      capacityForWeek,
      startDate: item.startDate!,
      endDate: item.endDate!
    };
  });

  const totalCapacity = breakdownItems.reduce((sum, item) => sum + item.capacityForWeek, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Capacity Breakdown - {pdtTeam.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Week {weekIndex + 1} ({workWeekStart.toLocaleDateString()} - {workWeekEnd.toLocaleDateString()})
          </p>
          <p className="text-lg font-semibold mt-2">
            Total Capacity: {totalCapacity.toFixed(1)}%
          </p>
        </div>

        {breakdownItems.length === 0 ? (
          <p className="text-gray-500">No work items in this week</p>
        ) : (
          <div className="space-y-3">
            {breakdownItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-blue-600">{item.workItem.name}</h3>
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {item.capacityForWeek.toFixed(1)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Work Days:</span>
                    <span className="ml-2 font-medium">{item.workDays}/5</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Base Capacity:</span>
                    <span className="ml-2 font-medium">{item.workItem.capacity}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Start Date:</span>
                    <span className="ml-2 font-medium">{item.startDate.toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">End Date:</span>
                    <span className="ml-2 font-medium">{item.endDate.toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Calculation: ({item.workItem.capacity}% ÷ 5) × {item.workDays} = {item.capacityForWeek.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const CapacityTable: React.FC<CapacityTableProps> = ({
  pdtTeams,
  workItems,
  selectedPDTFilter,
  onPDTFilterChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const weeks = getAllWeeksInYear(new Date().getFullYear());
  const baseDate = weeks[0].start;
  const [selectedCell, setSelectedCell] = useState<{ pdtTeam: PDTTeam; weekIndex: number } | null>(null);

  // Auto-scroll to current date on component mount
  useEffect(() => {
    if (containerRef.current) {
      const currentDate = new Date();
      const currentWeekIndex = getWeekIndex(currentDate, baseDate);
      
      if (currentWeekIndex >= 0 && currentWeekIndex < weeks.length) {
        const scrollX = currentWeekIndex * 80 - 400; // 300px for team name + max capacity columns + 100px buffer
        containerRef.current.scrollTo({
          left: Math.max(0, scrollX),
          behavior: 'smooth'
        });
      }
    }
  }, [baseDate, weeks.length]);

  const getCapacityPercentage = (pdtTeam: PDTTeam, weekIndex: number) => {
    const capacityData = calculateCapacityForWeek(pdtTeam.id, weekIndex, workItems, baseDate);
    return capacityData.capacityUsed;
  };

  const getCellColor = (percentage: number, maxCapacity: number) => {
    // Color coding based on percentage of max capacity
    if (percentage > maxCapacity) return 'bg-red-100 text-red-800 border-red-300';
    if (percentage > maxCapacity * 0.8) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (percentage > maxCapacity * 0.6) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getOverflowText = (percentage: number, maxCapacity: number) => {
    if (percentage > maxCapacity) {
      return `+${(percentage - maxCapacity).toFixed(0)}%`;
    } else if (percentage < maxCapacity) {
      return `-${(maxCapacity - percentage).toFixed(0)}%`;
    }
    return null;
  };

  const handleCellClick = (pdtTeam: PDTTeam, weekIndex: number) => {
    setSelectedCell({ pdtTeam, weekIndex });
  };

  const handleCloseModal = () => {
    setSelectedCell(null);
  };

  // Get today's position relative to work week
  const todayPosition = getTodayPosition(baseDate);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">PDT Team Capacity (52 Weeks)</h3>
        <p className="text-sm text-gray-600 mt-1">Click on a team to filter the roadmap view, click on a cell to see breakdown</p>
      </div>
      
      <div 
        ref={containerRef}
        className="overflow-x-auto relative w-full"
      >
        {/* Current date line */}
        {(() => {
          const currentDate = new Date();
          const currentWeekIndex = getWeekIndex(currentDate, baseDate);
          
          if (currentWeekIndex >= 0 && currentWeekIndex < weeks.length) {
            // Calculate position based on work week offset (Monday-Friday)
            const weekOffset = todayPosition.weekOffset; // 0-1 fraction of work week
            const lineX = 300 + currentWeekIndex * 80 + (weekOffset * 80); // 300px for team name + max capacity + offset within week
            return (
              <div
                className="absolute top-0 bottom-0 w-0.5 z-0"
                style={{
                  left: `${lineX}px`,
                  background: 'repeating-linear-gradient(to bottom, transparent, transparent 4px, #22c55e 4px, #22c55e 8px)'
                }}
              />
            );
          }
          return null;
        })()}
        
        <table className="w-full" style={{ minWidth: `${weeks.length * 80 + 300}px` }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-900 border-r border-gray-200" style={{ width: '200px', minWidth: '200px' }}>
                PDT Team
              </th>
              <th className="sticky left-[200px] z-10 bg-gray-50 px-4 py-3 text-center text-sm font-semibold text-gray-900 border-r border-gray-200" style={{ width: '100px', minWidth: '100px' }}>
                Max Capacity
              </th>
              {weeks.map((week, index) => (
                <th key={index} className="px-2 py-3 text-center text-xs font-semibold text-gray-900 border-r border-gray-200 min-w-[80px]">
                  <div>{week.label}</div>
                  <div className="text-xs text-gray-500 font-normal">
                    {week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pdtTeams
              .filter(team => selectedPDTFilter.length === 0 || selectedPDTFilter.includes(team.id))
              .map((team) => {
                const isSelected = selectedPDTFilter.includes(team.id);
                
                return (
                  <tr 
                    key={team.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                    onClick={() => {
                      if (isSelected) {
                        onPDTFilterChange(selectedPDTFilter.filter(id => id !== team.id));
                      } else {
                        onPDTFilterChange([...selectedPDTFilter, team.id]);
                      }
                    }}
                  >
                  <td className={`sticky left-0 z-10 px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200 ${
                    isSelected ? 'bg-blue-50' : 'bg-white'
                  }`} style={{ width: '200px', minWidth: '200px' }}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: team.color }}
                      />
                      <span>{team.name}</span>
                    </div>
                  </td>
                  <td className={`sticky left-[200px] z-10 px-4 py-3 text-center text-sm text-gray-900 border-r border-gray-200 ${
                    isSelected ? 'bg-blue-50' : 'bg-white'
                  }`} style={{ width: '100px', minWidth: '100px' }}>
                    {team.maxCapacity}%
                  </td>
                  {weeks.map((_, weekIndex) => {
                    const percentage = getCapacityPercentage(team, weekIndex);
                    const overflowText = getOverflowText(percentage, team.maxCapacity);
                    const isOverCapacity = percentage > team.maxCapacity;
                    
                    return (
                      <td 
                        key={weekIndex} 
                        className="px-2 py-3 text-center border-r border-gray-200 cursor-pointer hover:bg-gray-50"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleCellClick(team, weekIndex);
                        }}
                      >
                        <div className={`text-xs font-medium px-2 py-1 rounded border ${getCellColor(percentage, team.maxCapacity)}`}>
                          <div className="font-semibold">{percentage.toFixed(0)}%</div>
                          {overflowText && (
                            <div className={`text-xs font-bold ${
                              isOverCapacity ? 'text-red-700' : 'text-green-700'
                            }`}>
                              {overflowText}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span>0-60% of max</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>60-80% of max</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
                <span>80-100% of max</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                <span>Over max capacity</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Overflow indicators: <span className="text-red-700 font-semibold">+X%</span> for over capacity, <span className="text-green-700 font-semibold">-X%</span> for under capacity
            </div>
          </div>
          <div>
            {selectedPDTFilter.length > 0 && (
              <button
                onClick={() => onPDTFilterChange([])}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedCell && (
        <CapacityBreakdownModal
          isOpen={true}
          onClose={handleCloseModal}
          pdtTeam={selectedCell.pdtTeam}
          weekIndex={selectedCell.weekIndex}
          workItems={workItems}
          baseDate={baseDate}
        />
      )}
    </div>
  );
}; 