// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect } from 'react';
import { TimelineView } from './components/TimelineView';
import { CapacityPage } from './pages/CapacityPage';
import { Navigation } from './components/Navigation';
import { AlertsPopover } from './components/AlertsPopover';
import { WorkItemModal } from './components/WorkItemModal';
import { sampleProjects, samplePDTTeams, sampleWorkItems } from './data/sampleData';
import { generateAlerts } from './utils/calculations';
import { addWeeks } from 'date-fns';
import { Project, PDTTeam, WorkItem, Alert } from './types';

function App() {
  const [projects] = useState<Project[]>(sampleProjects);
  const [pdtTeams] = useState<PDTTeam[]>(samplePDTTeams);
  const [workItems, setWorkItems] = useState<WorkItem[]>(sampleWorkItems);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedPDTFilter, setSelectedPDTFilter] = useState<string[]>([]);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string[]>([]);
  const [editingWorkItem, setEditingWorkItem] = useState<WorkItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertsPopoverOpen, setIsAlertsPopoverOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'roadmap' | 'capacity'>('roadmap');


  // Generate alerts whenever work items or PDT teams change
  useEffect(() => {
    const newAlerts = generateAlerts(workItems, pdtTeams);
    setAlerts(newAlerts);
  }, [workItems, pdtTeams]);

  const handleWorkItemSave = (updatedWorkItem: WorkItem) => {
    setWorkItems(prev => 
      prev.map(item => 
        item.id === updatedWorkItem.id ? updatedWorkItem : item
      )
    );
  };

  const handleWorkItemDelete = (workItemId: string) => {
    setWorkItems(prev => prev.filter(item => item.id !== workItemId));
  };

  const handleWorkItemMove = (workItemId: string, newStartDate: Date) => {
    setWorkItems(prev => {
      const updatedItems = prev.map(item => {
        if (item.id === workItemId) {
          const newEndDate = addWeeks(newStartDate, item.duration);
          return {
            ...item,
            startDate: newStartDate,
            endDate: newEndDate,
            isInBacklog: false,
            // Ensure the item has all necessary properties for timeline display
            completedPercentage: item.completedPercentage || 0,
            dependencies: item.dependencies || [],
            successors: item.successors || []
          };
        }
        return item;
      });
      
      return updatedItems;
    });
  };

  const handleAcknowledgeDependency = (workItemId: string, dependencyId: string) => {
    setWorkItems(prev => {
      return prev.map(item => {
        if (item.id === workItemId) {
          const currentAcknowledged = item.acknowledgedDependencies || [];
          return {
            ...item,
            acknowledgedDependencies: [...currentAcknowledged, dependencyId]
          };
        }
        return item;
      });
    });
  };



  const handleEdit = (workItem: WorkItem) => {
    setEditingWorkItem(workItem);
    setIsModalOpen(true);
  };

  const handleAlertDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleWorkItemClick = (workItemId: string) => {
    const workItem = workItems.find(item => item.id === workItemId);
    if (workItem) {
      setEditingWorkItem(workItem);
      setIsModalOpen(true);
    }
  };

  const handlePDTClick = (pdtTeamId: string) => {
    setSelectedPDTFilter(prev => 
      prev.includes(pdtTeamId) 
        ? prev.filter(id => id !== pdtTeamId)
        : [...prev, pdtTeamId]
    );
  };

  const handleAlertsClick = () => {
    setIsAlertsPopoverOpen(true);
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Portfolio Management Tool
              </h1>
              <p className="text-sm text-gray-600">
                Dynamic Roadmap & Capacity Management
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {alerts.length > 0 && (
                <button
                  onClick={handleAlertsClick}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors cursor-pointer"
                >
                  {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* Main Content */}
      <main className="w-full">
        {currentPage === 'roadmap' ? (
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <TimelineView
              workItems={workItems}
              projects={projects}
              pdtTeams={pdtTeams}
              selectedPDTFilter={selectedPDTFilter}
              selectedProjectFilter={selectedProjectFilter}
              onEdit={handleEdit}
              onWorkItemMove={handleWorkItemMove}
              onPDTFilterChange={(pdtTeamIds) => setSelectedPDTFilter(pdtTeamIds)}
              onProjectFilterChange={(projectIds) => setSelectedProjectFilter(projectIds)}
              onAcknowledgeDependency={handleAcknowledgeDependency}
            />
          </div>
        ) : (
          <CapacityPage
            pdtTeams={pdtTeams}
            workItems={workItems}
            selectedPDTFilter={selectedPDTFilter}
            onPDTFilterChange={(pdtTeamIds) => setSelectedPDTFilter(pdtTeamIds)}
          />
        )}
      </main>

      {/* Work Item Modal */}
      <WorkItemModal
        workItem={editingWorkItem}
        projects={projects}
        pdtTeams={pdtTeams}
        allWorkItems={workItems}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWorkItem(null);
        }}
        onSave={handleWorkItemSave}
        onDelete={handleWorkItemDelete}
      />

      {/* Alerts Popover */}
      <AlertsPopover
        alerts={alerts}
        workItems={workItems}
        pdtTeams={pdtTeams}
        onDismiss={handleAlertDismiss}
        onWorkItemClick={handleWorkItemClick}
        onPDTClick={handlePDTClick}
        isOpen={isAlertsPopoverOpen}
        onClose={() => setIsAlertsPopoverOpen(false)}
      />
    </div>
  );
}

export default App; 