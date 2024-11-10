interface CalendarEventOptions {
  title: string;
  description: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  hour: number;
  minute: number;
}

export const createCalendarEvent = async (options: CalendarEventOptions): Promise<void> => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), options.hour, options.minute);
  
  // If the time today has passed, start tomorrow
  if (startDate < now) {
    startDate.setDate(startDate.getDate() + 1);
  }
  
  // End time is 1 hour after start
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  
  // Format dates for calendar
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:.]/g, '').split('.')[0];
  };
  
  const startDateStr = formatDate(startDate);
  const endDateStr = formatDate(endDate);
  
  // Create recurrence rule
  const rrule = `RRULE:FREQ=${options.frequency}`;
  
  // Create calendar URL
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(options.title)}&details=${encodeURIComponent(options.description)}&dates=${startDateStr}/${endDateStr}&recur=${encodeURIComponent(rrule)}`;
  
  // Open calendar in new tab
  window.open(googleCalendarUrl, '_blank');
};