import React from 'react';
import { Bell } from 'lucide-react';

interface ReminderButtonProps {
  assistantName: string;
}

export const ReminderButton: React.FC<ReminderButtonProps> = ({ assistantName }) => {
  const handleSetReminder = () => {
    try {
      // Create a calendar event for next week
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // Format dates for calendar
      const startDate = nextWeek.toISOString().replace(/[-:.]/g, '').split('.')[0];
      const endDate = new Date(nextWeek.getTime() + 60 * 60 * 1000)
        .toISOString()
        .replace(/[-:.]/g, '')
        .split('.')[0];
      
      // Create calendar event details
      const title = encodeURIComponent(`Log Update - ${assistantName}`);
      const details = encodeURIComponent(`Time to update your logs in ${assistantName}`);
      
      // Create calendar URL using webcal protocol
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${startDate}/${endDate}&recur=RRULE:FREQ=WEEKLY`;
      
      // Open calendar in new tab
      window.open(googleCalendarUrl, '_blank');
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Unable to create reminder. Please try again.');
    }
  };

  return (
    <button
      onClick={handleSetReminder}
      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      title="Set Weekly Reminder"
    >
      <Bell className="h-5 w-5 text-gray-600" />
    </button>
  );
};