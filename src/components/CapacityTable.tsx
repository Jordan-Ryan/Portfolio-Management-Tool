import React, { useRef, useEffect } from 'react';
import { PDTTeam, WorkItem } from '../types';
import { calculateCapacityForWeek } from '../utils/calculations';
import { getAllWeeksInYear, getWeekIndex } from '../utils/dateUtils';

interface CapacityTableProps {
  pdtTeams: PDTTeam[];
  workItems: WorkItem[];
  selectedPDTFilter: string | null;
  onPDTFilterChange: (pdtTeamId: string | null) => void;
}

export const CapacityTable: React.FC<CapacityTableProps> = ({
  pdtTeams,
  workItems,
  selectedPDTFilter,
  onPDTFilterChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const weeks = getAllWeeksInYear(new Date().getFullYear());
  const baseDate = weeks[0].start;

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
    return (capacityData.capacityUsed / pdtTeam.maxCapacity) * 100;
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">PDT Team Capacity (52 Weeks)</h3>
        <p className="text-sm text-gray-600 mt-1">Click on a team to filter the roadmap view</p>
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
            const lineX = 300 + currentWeekIndex * 80 + 40; // 200px (PDT Team) + 100px (Max Capacity) + 40px (center of week)
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
            {pdtTeams.map((team) => {
              const isSelected = selectedPDTFilter === team.id;
              return (
                <tr 
                  key={team.id}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => onPDTFilterChange(isSelected ? null : team.id)}
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
                    const isUnderCapacity = percentage < team.maxCapacity;
                    
                    return (
                      <td key={weekIndex} className="px-2 py-3 text-center border-r border-gray-200">
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
            {selectedPDTFilter && (
              <button
                onClick={() => onPDTFilterChange(null)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 