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
  const [isAddDependencyOpen, setIsAddDependencyOpen] = useState(false);
  const [dependencySearchTerm, setDependencySearchTerm] = useState('');
  const [dependencyType, setDependencyType] = useState<'predecessor' | 'successor'>('predecessor');

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
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Dependencies
              </label>
              <button
                onClick={() => setIsAddDependencyOpen(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Dependency
              </button>
            </div>
            
            {/* Predecessors */}
            {selectedDependencies.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Predecessors:</h4>
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
                          <span className="text-xs text-gray-400">ID: {depItem.id}</span>
                        </div>
                        <button
                          onClick={() => {
                            // Remove from predecessors
                            setSelectedDependencies(prev => prev.filter(id => id !== depId));
                            // Also remove this work item from the predecessor's successors
                            const updatedDepItem = {
                              ...depItem,
                              successors: depItem.successors?.filter(id => id !== workItem.id) || []
                            };
                            onSave(updatedDepItem);
                          }}
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

            {/* Successors */}
            {(formData.successors && formData.successors.length > 0) && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Successors:</h4>
                <div className="space-y-2">
                  {formData.successors.map(succId => {
                    const succItem = allWorkItems.find(item => item.id === succId);
                    if (!succItem) return null;
                    const succProject = projects.find(p => p.id === succItem.projectId);
                    return (
                      <div key={succId} className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: succProject?.color || '#gray' }}
                          />
                          <span className="text-sm font-medium text-gray-900">{succItem.name}</span>
                          <span className="text-xs text-gray-500">({succProject?.name})</span>
                          <span className="text-xs text-gray-400">ID: {succItem.id}</span>
                        </div>
                        <button
                          onClick={() => {
                            // Remove from successors
                            const updatedSuccessors = formData.successors?.filter(id => id !== succId) || [];
                            handleInputChange('successors', updatedSuccessors);
                            // Also remove this work item from the successor's dependencies
                            const updatedSuccItem = {
                              ...succItem,
                              dependencies: succItem.dependencies?.filter(id => id !== workItem.id) || []
                            };
                            onSave(updatedSuccItem);
                          }}
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

      {/* Add Dependency Popup */}
      {isAddDependencyOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Dependency
              </h3>
              <button
                onClick={() => {
                  setIsAddDependencyOpen(false);
                  setDependencySearchTerm('');
                  setDependencyType('predecessor');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Dependency Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dependency Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="predecessor"
                      checked={dependencyType === 'predecessor'}
                      onChange={(e) => setDependencyType(e.target.value as 'predecessor' | 'successor')}
                      className="mr-2"
                    />
                    <span className="text-sm">Predecessor</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="successor"
                      checked={dependencyType === 'successor'}
                      onChange={(e) => setDependencyType(e.target.value as 'predecessor' | 'successor')}
                      className="mr-2"
                    />
                    <span className="text-sm">Successor</span>
                  </label>
                </div>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Work Items
                </label>
                <input
                  type="text"
                  placeholder="Search by ID or name..."
                  value={dependencySearchTerm}
                  onChange={(e) => setDependencySearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Search Results */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Work Items
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
                  {allWorkItems
                    .filter(item => {
                      if (item.id === workItem.id) return false;
                      if (dependencyType === 'predecessor' && selectedDependencies.includes(item.id)) return false;
                      if (dependencyType === 'successor' && formData.successors?.includes(item.id)) return false;
                      
                      const searchLower = dependencySearchTerm.toLowerCase();
                      return item.id.toLowerCase().includes(searchLower) || 
                             item.name.toLowerCase().includes(searchLower);
                    })
                    .map(item => {
                      const project = projects.find(p => p.id === item.projectId);
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            if (dependencyType === 'predecessor') {
                              setSelectedDependencies(prev => [...prev, item.id]);
                              // Also add this work item to the predecessor's successors
                              const updatedDepItem = {
                                ...item,
                                successors: [...(item.successors || []), workItem.id]
                              };
                              onSave(updatedDepItem);
                            } else {
                              const updatedSuccessors = [...(formData.successors || []), item.id];
                              handleInputChange('successors', updatedSuccessors);
                              // Also add this work item to the successor's dependencies
                              const updatedSuccItem = {
                                ...item,
                                dependencies: [...(item.dependencies || []), workItem.id]
                              };
                              onSave(updatedSuccItem);
                            }
                            setIsAddDependencyOpen(false);
                            setDependencySearchTerm('');
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: project?.color || '#gray' }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">
                                {project?.name} • ID: {item.id}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-blue-600">
                            Add as {dependencyType}
                          </div>
                        </div>
                      );
                    })}
                                     {allWorkItems.filter(item => {
                     if (item.id === workItem.id) return false;
                     if (dependencyType === 'predecessor' && selectedDependencies.includes(item.id)) return false;
                     if (dependencyType === 'successor' && formData.successors?.includes(item.id)) return false;
                     
                     const searchLower = dependencySearchTerm.toLowerCase();
                     return item.id.toLowerCase().includes(searchLower) || 
                            item.name.toLowerCase().includes(searchLower);
                   }).length === 0 && (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      No work items found
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setIsAddDependencyOpen(false);
                  setDependencySearchTerm('');
                  setDependencyType('predecessor');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 