import React, { useState, useEffect } from 'react';
import { CapacityTable } from '../components/CapacityTable';
import { PDTTeam, WorkItem } from '../types';

interface CapacityPageProps {
  pdtTeams: PDTTeam[];
  workItems: WorkItem[];
  selectedPDTFilter: string[];
  onPDTFilterChange: (pdtTeamIds: string[]) => void;
}

export const CapacityPage: React.FC<CapacityPageProps> = ({
  pdtTeams,
  workItems,
  selectedPDTFilter,
  onPDTFilterChange
}) => {
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isFilterDropdownOpen && !target.closest('[data-filter-dropdown]')) {
        setIsFilterDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterDropdownOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PDT Team Capacity</h1>
              <p className="mt-2 text-gray-600">
                Monitor team capacity utilization across all 52 weeks of the year
              </p>
            </div>
            
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
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="w-full">
          <CapacityTable
            pdtTeams={pdtTeams}
            workItems={workItems}
            selectedPDTFilter={selectedPDTFilter}
            onPDTFilterChange={onPDTFilterChange}
          />
        </div>
      </div>
    </div>
  );
}; 