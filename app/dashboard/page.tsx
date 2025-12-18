import CalendarView from '@/components/calendar/CalendarView';

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Calendar Availability
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your availability and blocked dates
        </p>
      </div>
      <CalendarView />
    </div>
  );
}
