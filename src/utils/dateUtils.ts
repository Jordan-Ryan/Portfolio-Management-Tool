import { addWeeks, differenceInWeeks, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export const getWeekRange = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return { start, end };
};

export const getWeekIndex = (date: Date, baseDate: Date) => {
  return differenceInWeeks(date, baseDate);
};

export const getDateFromWeekIndex = (weekIndex: number, baseDate: Date) => {
  return addWeeks(baseDate, weekIndex);
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