import React from 'react';

interface NavigationProps {
  currentPage: 'roadmap' | 'capacity';
  onPageChange: (page: 'roadmap' | 'capacity') => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  onPageChange
}) => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex space-x-8">
              <button
                onClick={() => onPageChange('roadmap')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  currentPage === 'roadmap'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Project Roadmap
              </button>
              <button
                onClick={() => onPageChange('capacity')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  currentPage === 'capacity'
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                PDT Team Capacity
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}; 