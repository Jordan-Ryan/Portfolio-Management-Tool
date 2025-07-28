import { Project, PDTTeam, WorkItem } from '../types';
import { addWeeks, subWeeks } from 'date-fns';

const currentDate = new Date();

export const sampleProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'E-commerce Platform Redesign',
    priority: 95,
    color: '#3b82f6',
    startDate: subWeeks(currentDate, 4)
  },
  {
    id: 'proj-2',
    name: 'Mobile App Development',
    priority: 88,
    color: '#10b981',
    startDate: subWeeks(currentDate, 6)
  },
  {
    id: 'proj-3',
    name: 'Data Analytics Dashboard',
    priority: 75,
    color: '#f59e0b',
    startDate: subWeeks(currentDate, 5)
  },
  {
    id: 'proj-4',
    name: 'API Gateway Migration',
    priority: 65,
    color: '#8b5cf6',
    startDate: subWeeks(currentDate, 8)
  }
];

export const samplePDTTeams: PDTTeam[] = [
  {
    id: 'pdt-1',
    name: 'Frontend Team',
    maxCapacity: 80, // 80%
    color: '#3b82f6'
  },
  {
    id: 'pdt-2',
    name: 'Backend Team',
    maxCapacity: 85, // 85%
    color: '#10b981'
  },
  {
    id: 'pdt-3',
    name: 'DevOps Team',
    maxCapacity: 75, // 75%
    color: '#f59e0b'
  },
  {
    id: 'pdt-4',
    name: 'QA Team',
    maxCapacity: 80, // 80%
    color: '#ef4444'
  },
  {
    id: 'pdt-5',
    name: 'Design Team',
    maxCapacity: 70, // 70%
    color: '#8b5cf6'
  }
];

export const sampleWorkItems: WorkItem[] = [
  // E-commerce Platform Redesign
  {
    id: 'work-1',
    name: 'UI/UX Design Phase',
    projectId: 'proj-1',
    pdtTeamId: 'pdt-5',
    startDate: subWeeks(currentDate, 4), // Past work - completed
    endDate: subWeeks(currentDate, 2),
    duration: 2,
    capacity: 40, // 40% of team capacity
    completedPercentage: 100, // Completed
    dependencies: [],
    successors: ['work-2'],
    isInBacklog: false,
    acknowledgedDependencies: []
  },
  {
    id: 'work-2',
    name: 'Frontend Development',
    projectId: 'proj-1',
    pdtTeamId: 'pdt-1',
    startDate: subWeeks(currentDate, 2), // Current work - behind schedule
    endDate: addWeeks(currentDate, 2),
    duration: 4,
    capacity: 60, // 60% of team capacity
    completedPercentage: 25, // Should be ~50% but only 25% - ALERT: Behind schedule
    dependencies: ['work-1'],
    successors: ['work-3'],
    isInBacklog: false,
    acknowledgedDependencies: []
  },
  {
    id: 'work-3',
    name: 'Backend API Development',
    projectId: 'proj-1',
    pdtTeamId: 'pdt-2',
    startDate: addWeeks(currentDate, 1), // Future work
    endDate: addWeeks(currentDate, 5),
    duration: 4,
    capacity: 50, // 50% of team capacity
    completedPercentage: 0, // Not started
    dependencies: [],
    successors: ['work-4'],
    isInBacklog: false,
    acknowledgedDependencies: []
  },
  {
    id: 'work-4',
    name: 'Integration Testing',
    projectId: 'proj-1',
    pdtTeamId: 'pdt-3',
    startDate: addWeeks(currentDate, 5),
    endDate: addWeeks(currentDate, 8),
    duration: 3,
    capacity: 30, // 30% of team capacity
    completedPercentage: 0,
    dependencies: ['work-2', 'work-3'],
    successors: [],
    isInBacklog: false,
    acknowledgedDependencies: []
  },
  
  // Mobile App Development
  {
    id: 'work-5',
    name: 'Mobile UI Design',
    projectId: 'proj-2',
    pdtTeamId: 'pdt-5',
    startDate: subWeeks(currentDate, 6), // Past work - should be 100% complete
    endDate: subWeeks(currentDate, 4),
    duration: 2,
    capacity: 50, // 50% of team capacity
    completedPercentage: 80, // ALERT: Past work not 100% complete
    dependencies: [],
    successors: ['work-6'],
    isInBacklog: false
  },
  {
    id: 'work-6',
    name: 'iOS Development',
    projectId: 'proj-2',
    pdtTeamId: 'pdt-1',
    startDate: subWeeks(currentDate, 3), // Current work - dependency overlap
    endDate: addWeeks(currentDate, 3),
    duration: 6,
    capacity: 70, // 70% of team capacity
    completedPercentage: 40,
    dependencies: ['work-5'],
    successors: ['work-8'],
    isInBacklog: false
  },
  {
    id: 'work-7',
    name: 'Android Development',
    projectId: 'proj-2',
    pdtTeamId: 'pdt-1',
    startDate: subWeeks(currentDate, 2), // ALERT: Dependency overlap with work-6
    endDate: addWeeks(currentDate, 4),
    duration: 6,
    capacity: 40, // 40% of team capacity
    completedPercentage: 25,
    dependencies: ['work-5'],
    successors: ['work-8'],
    isInBacklog: false
  },
  {
    id: 'work-8',
    name: 'Mobile Testing',
    projectId: 'proj-2',
    pdtTeamId: 'pdt-4',
    startDate: addWeeks(currentDate, 2), // Future work
    endDate: addWeeks(currentDate, 6),
    duration: 4,
    capacity: 35, // 35% of team capacity
    completedPercentage: 0,
    dependencies: ['work-6', 'work-7'],
    successors: [],
    isInBacklog: false
  },
  
  // Data Analytics Dashboard
  {
    id: 'work-9',
    name: 'Data Pipeline Setup',
    projectId: 'proj-3',
    pdtTeamId: 'pdt-2',
    startDate: subWeeks(currentDate, 5), // Past work - completed
    endDate: subWeeks(currentDate, 2),
    duration: 3,
    capacity: 45, // 45% of team capacity
    completedPercentage: 100,
    dependencies: [],
    successors: ['work-10'],
    isInBacklog: false
  },
  {
    id: 'work-10',
    name: 'Dashboard Development',
    projectId: 'proj-3',
    pdtTeamId: 'pdt-1',
    startDate: subWeeks(currentDate, 1), // Current work - behind schedule
    endDate: addWeeks(currentDate, 4),
    duration: 5,
    capacity: 55, // 55% of team capacity
    completedPercentage: 15, // Should be ~40% but only 15% - ALERT: Behind schedule
    dependencies: ['work-9'],
    successors: ['work-11'],
    isInBacklog: false
  },
  {
    id: 'work-11',
    name: 'Performance Optimization',
    projectId: 'proj-3',
    pdtTeamId: 'pdt-3',
    startDate: addWeeks(currentDate, 3), // Future work - ALERT: Has completion percentage
    endDate: addWeeks(currentDate, 6),
    duration: 3,
    capacity: 25, // 25% of team capacity
    completedPercentage: 30, // ALERT: Future work shouldn't have completion percentage
    dependencies: ['work-10'],
    successors: [],
    isInBacklog: false
  },
  
  // API Gateway Migration
  {
    id: 'work-12',
    name: 'Infrastructure Planning',
    projectId: 'proj-4',
    pdtTeamId: 'pdt-3',
    startDate: subWeeks(currentDate, 8), // Past work - completed
    endDate: subWeeks(currentDate, 7),
    duration: 1,
    capacity: 35, // 35% of team capacity
    completedPercentage: 100,
    dependencies: [],
    successors: ['work-13'],
    isInBacklog: false
  },
  {
    id: 'work-13',
    name: 'Gateway Implementation',
    projectId: 'proj-4',
    pdtTeamId: 'pdt-2',
    startDate: subWeeks(currentDate, 6), // Current work - behind schedule
    endDate: addWeeks(currentDate, 2),
    duration: 8,
    capacity: 65, // 65% of team capacity
    completedPercentage: 30, // Should be ~75% but only 30% - ALERT: Behind schedule
    dependencies: ['work-12'],
    successors: ['work-14'],
    isInBacklog: false
  },
  {
    id: 'work-14',
    name: 'Migration Testing',
    projectId: 'proj-4',
    pdtTeamId: 'pdt-4',
    startDate: addWeeks(currentDate, 1), // Future work
    endDate: addWeeks(currentDate, 4),
    duration: 3,
    capacity: 40, // 40% of team capacity
    completedPercentage: 0,
    dependencies: ['work-13'],
    successors: [],
    isInBacklog: false
  },
  
  // Backlog items
  {
    id: 'work-15',
    name: 'Security Audit',
    projectId: 'proj-1',
    pdtTeamId: 'pdt-3',
    startDate: undefined,
    endDate: undefined,
    duration: 2,
    capacity: 20, // 20% of team capacity
    completedPercentage: 0,
    dependencies: ['work-4'],
    successors: [],
    isInBacklog: true
  },
  {
    id: 'work-16',
    name: 'Performance Testing',
    projectId: 'proj-2',
    pdtTeamId: 'pdt-4',
    startDate: undefined,
    endDate: undefined,
    duration: 3,
    capacity: 30, // 30% of team capacity
    completedPercentage: 0,
    dependencies: ['work-8'],
    successors: [],
    isInBacklog: true
  },
  {
    id: 'work-17',
    name: 'Documentation Update',
    projectId: 'proj-3',
    pdtTeamId: 'pdt-1',
    startDate: undefined,
    endDate: undefined,
    duration: 1,
    capacity: 15, // 15% of team capacity
    completedPercentage: 0,
    dependencies: ['work-11'],
    successors: [],
    isInBacklog: true
  },
  {
    id: 'work-18',
    name: 'Overdue Backlog Item',
    projectId: 'proj-1',
    pdtTeamId: 'pdt-2',
    startDate: undefined,
    endDate: undefined,
    duration: 2,
    capacity: 25, // 25% of team capacity
    completedPercentage: 45, // ALERT: Backlog item shouldn't have completion percentage
    dependencies: ['work-4'],
    successors: [],
    isInBacklog: true
  }
]; 