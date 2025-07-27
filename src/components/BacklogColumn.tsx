import React from 'react';
import { WorkItem, Project, PDTTeam } from '../types';
import { getWorkItemsByProject } from '../utils/calculations';
import { Clock, Users } from 'lucide-react';

interface BacklogColumnProps {
  workItems: WorkItem[];
  projects: Project[];
  pdtTeams: PDTTeam[];
  onDragStart: (e: React.DragEvent, workItem: WorkItem) => void;
  onEdit: (workItem: WorkItem) => void;
}

export const BacklogColumn: React.FC<BacklogColumnProps> = ({
  workItems,
  projects,
  pdtTeams,
  onDragStart,
  onEdit
}) => {
  const backlogItems = workItems.filter(item => item.isInBacklog);
  const groupedByProject = projects
    .sort((a, b) => b.priority - a.priority)
    .map(project => ({
      project,
      items: getWorkItemsByProject(backlogItems, project.id)
    }))
    .filter(group => group.items.length > 0);

  const getPDTTeam = (pdtTeamId: string) => {
    return pdtTeams.find(team => team.id === pdtTeamId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">Backlog</h3>
        <p className="text-sm text-gray-600">Drag items to schedule them</p>
      </div>
      
      <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {groupedByProject.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p className="text-sm">No items in backlog</p>
          </div>
        ) : (
          groupedByProject.map(({ project, items }) => (
            <div key={project.id} className="space-y-3">
              {/* Project Header */}
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <h4 className="font-medium text-gray-900">{project.name}</h4>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  Priority: {project.priority}
                </span>
              </div>
              
              {/* Work Items */}
              <div className="space-y-2 ml-6">
                {items.map(workItem => {
                  const pdtTeam = getPDTTeam(workItem.pdtTeamId);
                  return (
                    <div
                      key={workItem.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, workItem)}
                      onDoubleClick={() => onEdit(workItem)}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-move hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 text-sm truncate">
                            {workItem.name}
                          </h5>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{workItem.capacity} FTEs</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{workItem.duration} weeks</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-3">
                          {pdtTeam && (
                            <div className="flex items-center space-x-1">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: pdtTeam.color }}
                              />
                              <span className="text-xs text-gray-600">{pdtTeam.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Dependencies */}
                      {workItem.dependencies.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            Depends on: {workItem.dependencies.length} item(s)
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 