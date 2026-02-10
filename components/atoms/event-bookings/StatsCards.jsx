import { Calendar, AlertCircle, CheckCircle, CreditCard, TrendingUp, Users } from 'lucide-react';

const StatsCards = ({ stats }) => {
  const statItems = [
    {
      label: 'Total Bookings',
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: AlertCircle,
      color: 'bg-amber-100 text-amber-600'
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600'
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.revenue.toLocaleString()}`,
      icon: CreditCard,
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      label: 'Advance Collected',
      value: `₹${stats.advance.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      label: 'Upcoming',
      value: stats.upcoming,
      icon: Users,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {statItems.map((item, index) => (
        <div key={index} className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">{item.label}</p>
              <p className="text-lg font-semibold text-gray-900">{item.value}</p>
            </div>
            <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center`}>
              <item.icon className="w-5 h-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;