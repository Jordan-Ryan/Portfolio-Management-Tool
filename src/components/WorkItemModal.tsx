import React, { useState, useEffect } from 'react';
import { WorkItem, Project, PDTTeam } from '../types';
import { X, Save, Trash2 } from 'lucide-react';

interface WorkItemModalProps {
  workItem: WorkItem | null;
  projects: Project[];
  pdtTeams: PDTTeam[];
  allWorkItems: WorkItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (workItem: WorkItem) => void;
  onDelete: (workItemId: string) => void;
}

export const WorkItemModal: React.FC<WorkItemModalProps> = ({
  workItem,
  projects,
  pdtTeams,
  allWorkItems,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<WorkItem>>({});
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);

  useEffect(() => {
    if (workItem) {
      setFormData({
        ...workItem,
        startDate: workItem.startDate ? new Date(workItem.startDate) : undefined,
        endDate: workItem.endDate ? new Date(workItem.endDate) : undefined
      });
      setSelectedDependencies(workItem.dependencies);
    }
  }, [workItem]);

  if (!isOpen || !workItem) return null;

  const handleInputChange = (field: keyof WorkItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const date = value ? new Date(value) : undefined;
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleSave = () => {
    const updatedWorkItem: WorkItem = {
      ...workItem,
      ...formData,
      dependencies: selectedDependencies,
      isInBacklog: !formData.startDate || !formData.endDate
    } as WorkItem;
    
    onSave(updatedWorkItem);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this work item?')) {
      onDelete(workItem.id);
      onClose();
    }
  };

  const availableDependencies = allWorkItems.filter(item => item.id !== workItem.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Edit Work Item
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select
                value={formData.projectId || ''}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PDT Team
              </label>
              <select
                value={formData.pdtTeamId || ''}
                onChange={(e) => handleInputChange('pdtTeamId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {pdtTeams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration || ''}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity (%)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.capacity || ''}
                onChange={(e) => handleInputChange('capacity', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.completedPercentage || ''}
                onChange={(e) => handleInputChange('completedPercentage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate ? formData.startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate ? formData.endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Dependencies */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Predecessors (Dependencies)
            </label>
            
            {/* Current Dependencies */}
            {selectedDependencies.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Current Predecessors:</h4>
                <div className="space-y-2">
                  {selectedDependencies.map(depId => {
                    const depItem = allWorkItems.find(item => item.id === depId);
                    if (!depItem) return null;
                    const depProject = projects.find(p => p.id === depItem.projectId);
                    return (
                      <div key={depId} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: depProject?.color || '#gray' }}
                          />
                          <span className="text-sm font-medium text-gray-900">{depItem.name}</span>
                          <span className="text-xs text-gray-500">({depProject?.name})</span>
                        </div>
                        <button
                          onClick={() => setSelectedDependencies(prev => prev.filter(id => id !== depId))}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add New Dependencies */}
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                {selectedDependencies.length > 0 ? 'Add More Predecessors:' : 'Add Predecessors:'}
              </h4>
              <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                {availableDependencies
                  .filter(item => !selectedDependencies.includes(item.id))
                  .map(item => {
                    const project = projects.find(p => p.id === item.projectId);
                    return (
                      <label key={item.id} className="flex items-center space-x-2 py-1 hover:bg-gray-50 rounded px-1">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDependencies(prev => [...prev, item.id]);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: project?.color || '#gray' }}
                          />
                          <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                          <span className="text-xs text-gray-500">({project?.name})</span>
                        </div>
                      </label>
                    );
                  })}
                {availableDependencies.filter(item => !selectedDependencies.includes(item.id)).length === 0 && (
                  <div className="text-sm text-gray-500 italic py-2">
                    No more work items available to add as predecessors
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Successors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Successors (Dependent Work Items)
            </label>
            
            {/* Current Successors */}
            {workItem.successors && workItem.successors.length > 0 ? (
              <div className="space-y-2">
                {workItem.successors.map(succId => {
                  const succItem = allWorkItems.find(item => item.id === succId);
                  if (!succItem) return null;
                  const succProject = projects.find(p => p.id === succItem.projectId);
                  return (
                    <div key={succId} className="flex items-center p-2 bg-blue-50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: succProject?.color || '#gray' }}
                        />
                        <span className="text-sm font-medium text-gray-900">{succItem.name}</span>
                        <span className="text-xs text-gray-500">({succProject?.name})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic py-2">
                No work items depend on this item
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 