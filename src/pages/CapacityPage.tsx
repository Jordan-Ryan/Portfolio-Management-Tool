import React from 'react';
import { CapacityTable } from '../components/CapacityTable';
import { PDTTeam, WorkItem } from '../types';

interface CapacityPageProps {
  pdtTeams: PDTTeam[];
  workItems: WorkItem[];
  selectedPDTFilter: string | null;
  onPDTFilterChange: (pdtTeamId: string | null) => void;
}

export const CapacityPage: React.FC<CapacityPageProps> = ({
  pdtTeams,
  workItems,
  selectedPDTFilter,
  onPDTFilterChange
}) => {
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
            
            {/* PDT Filter Dropdown */}
            <div className="flex items-center space-x-2">
              <label htmlFor="capacity-pdt-filter" className="text-sm font-medium text-gray-700">
                Filter by PDT:
              </label>
              <select
                id="capacity-pdt-filter"
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