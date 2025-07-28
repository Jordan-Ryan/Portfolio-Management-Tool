import { addWeeks, differenceInWeeks, startOfWeek, endOfWeek, isWithinInterval, addDays, differenceInDays, getDay } from 'date-fns';

export const getWeekRange = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
};

export const getWorkWeekRange = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
  const end = addDays(start, 4); // Friday end (Monday + 4 days)
  return { start, end };
};

export const getWeekIndex = (date: Date, baseDate: Date) => {
  // Get the start of the week for the given date
  const { start: weekStart } = getWeekRange(date);
  // Calculate the difference in weeks from the base date
  return differenceInWeeks(weekStart, baseDate);
};

export const getWeekOffset = (date: Date) => {
  // Get the start of the week for the given date
  const { start: weekStart } = getWeekRange(date);
  // Calculate how many days into the week the date is (0-6)
  const daysDiff = Math.floor((date.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
  // Return the offset as a fraction of the week (0-1)
  return daysDiff / 7;
};

export const getWorkWeekOffset = (date: Date) => {
  // Get the start of the work week (Monday) for the given date
  const { start: weekStart } = getWorkWeekRange(date);
  // Calculate how many work days into the week the date is (0-4 for Monday-Friday)
  const daysDiff = Math.floor((date.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000));
  // Return the offset as a fraction of the work week (0-1)
  return Math.min(1, Math.max(0, daysDiff / 5));
};

export const getTodayPosition = (baseDate: Date) => {
  const today = new Date();
  const weekIndex = getWeekIndex(today, baseDate);
  const weekOffset = getWorkWeekOffset(today);
  return { weekIndex, weekOffset };
};

export const getDateFromWeekIndex = (weekIndex: number, baseDate: Date) => {
  return addWeeks(baseDate, weekIndex);
};

export const getDateFromWeekIndexAndOffset = (weekIndex: number, weekOffset: number, baseDate: Date) => {
  const weekStart = addWeeks(baseDate, weekIndex);
  const daysOffset = Math.floor(weekOffset * 5); // 5 work days per week
  return addDays(weekStart, daysOffset);
};

export interface WeekInfo {
  index: number;
  start: Date;
  end: Date;
  label: string;
}

export const getWeekNumber = (date: Date): number => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + startOfYear.getDay() + 1) / 7);
};

export const getAllWeeksInYear = (year: number = new Date().getFullYear()): WeekInfo[] => {
  const weeks: WeekInfo[] = [];
  
  // Get the first day of the year
  const firstDayOfYear = new Date(year, 0, 1);
  
  // Find the first Monday of the year (or the first day if it's already Monday)
  const firstMonday = new Date(firstDayOfYear);
  const dayOfWeek = firstMonday.getDay();
  const daysToAdd = dayOfWeek === 0 ? 1 : (8 - dayOfWeek); // Sunday = 0, Monday = 1, etc.
  firstMonday.setDate(firstMonday.getDate() + daysToAdd);
  
  // Generate all 52 weeks
  for (let i = 0; i < 52; i++) {
    const weekDate = addWeeks(firstMonday, i);
    const { start, end } = getWeekRange(weekDate);
    const weekNumber = getWeekNumber(start);
    
    weeks.push({
      index: i,
      start,
      end,
      label: `W${weekNumber}`
    });
  }
  
  return weeks;
};

export const getWeeksAroundDate = (centerDate: Date = new Date(), weeksBefore: number = 6, weeksAfter: number = 6): WeekInfo[] => {
  const weeks: WeekInfo[] = [];
  
  for (let i = -weeksBefore; i <= weeksAfter; i++) {
    const weekDate = addWeeks(centerDate, i);
    const { start, end } = getWeekRange(weekDate);
    const weekNumber = getWeekNumber(start);
    
    weeks.push({
      index: i + weeksBefore,
      start,
      end,
      label: `W${weekNumber}`
    });
  }
  return weeks;
};

export const isDateInRange = (date: Date, startDate: Date, endDate: Date) => {
  return isWithinInterval(date, { start: startDate, end: endDate });
};

export const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatWeekRange = (startDate: Date, endDate: Date) => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

// Helper function to calculate partial week capacity
export const calculatePartialWeekCapacity = (startDate: Date, endDate: Date, weekStart: Date, weekEnd: Date, totalCapacity: number): number => {
  // Normalize all dates to remove time components
  const normalizeDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const normalizedStartDate = normalizeDate(startDate);
  const normalizedEndDate = normalizeDate(endDate);
  const normalizedWeekStart = normalizeDate(weekStart);
  const normalizedWeekEnd = normalizeDate(weekEnd);

  // If the work item doesn't overlap with this week, return 0
  if (normalizedEndDate < normalizedWeekStart || normalizedStartDate > normalizedWeekEnd) {
    return 0;
  }

  // Calculate the overlap period - include the start and end dates
  const overlapStart = new Date(Math.max(normalizedStartDate.getTime(), normalizedWeekStart.getTime()));
  const overlapEnd = new Date(Math.min(normalizedEndDate.getTime(), normalizedWeekEnd.getTime()));

  // Calculate work days in the overlap period (Monday-Friday only)
  let workDays = 0;
  const currentDate = new Date(overlapStart);
  
  // Use inclusive comparison - include both start and end dates
  while (currentDate <= overlapEnd) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Always return partial capacity, even for 5 days
  return (totalCapacity / 5) * workDays;
}; 