import React from 'react';
import { Alert, WorkItem, PDTTeam } from '../types';
import { AlertTriangle, Clock, Users, X } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
  workItems: WorkItem[];
  pdtTeams: PDTTeam[];
  onDismiss: (alertId: string) => void;
  onWorkItemClick: (workItemId: string) => void;
  onPDTClick: (pdtTeamId: string) => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  workItems,
  pdtTeams,
  onDismiss,
  onWorkItemClick,
  onPDTClick
}) => {
  const getWorkItem = (workItemId: string) => {
    return workItems.find(item => item.id === workItemId);
  };

  const getPDTTeam = (pdtTeamId: string) => {
    return pdtTeams.find(team => team.id === pdtTeamId);
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'delay':
        return <Clock className="h-4 w-4" />;
      case 'dependency':
        return <AlertTriangle className="h-4 w-4" />;
      case 'capacity':
        return <Users className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (severity: Alert['severity']) => {
    return severity === 'error' ? 'text-red-600' : 'text-yellow-600';
  };

  const getAlertBgColor = (severity: Alert['severity']) => {
    return severity === 'error' ? 'bg-red-50' : 'bg-yellow-50';
  };

  const getAlertBorderColor = (severity: Alert['severity']) => {
    return severity === 'error' ? 'border-red-200' : 'border-yellow-200';
  };

  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
        </div>
        <div className="px-6 py-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">No alerts at this time</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
        <p className="text-sm text-gray-600 mt-1">
          {alerts.length} alert{alerts.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {alerts.map(alert => {
          const workItem = alert.workItemId ? getWorkItem(alert.workItemId) : null;
          const pdtTeam = alert.pdtTeamId ? getPDTTeam(alert.pdtTeamId) : null;
          
          return (
            <div
              key={alert.id}
              className={`p-4 ${getAlertBgColor(alert.severity)} border-l-4 ${getAlertBorderColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`mt-0.5 ${getAlertColor(alert.severity)}`}>
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${getAlertColor(alert.severity)}`}>
                      {alert.message}
                    </p>
                    
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-600">
                      <span className="capitalize">{alert.type} issue</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.severity === 'error' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="mt-3 flex items-center space-x-3">
                      {workItem && (
                        <button
                          onClick={() => onWorkItemClick(workItem.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Work Item
                        </button>
                      )}
                      
                      {pdtTeam && (
                        <button
                          onClick={() => onPDTClick(pdtTeam.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View PDT Team
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onDismiss(alert.id)}
                  className="text-gray-400 hover:text-gray-600 ml-3"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Error</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Warning</span>
            </div>
          </div>
          
          <button
            onClick={() => alerts.forEach(alert => onDismiss(alert.id))}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Dismiss All
          </button>
        </div>
      </div>
    </div>
  );
}; 