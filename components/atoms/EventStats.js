// components/atoms/EventStats.js
import { Heart, Cake, Calendar, Clock } from 'lucide-react';

const EventStats = ({ 
  totalBookings, 
  confirmedCount, 
  upcomingCount, 
  marriageCount, 
  birthdayCount, 
  completedCount 
}) => {
  const stats = [
    {
      icon: <Heart className="w-5 h-5 text-primary" />,
      label: "Weddings",
      value: marriageCount,
      bgColor: "bg-primary/10"
    },
    {
      icon: <Cake className="w-5 h-5 text-primary" />,
      label: "Birthdays",
      value: birthdayCount,
      bgColor: "bg-primary/10"
    },
    {
      icon: <Calendar className="w-5 h-5 text-primary" />,
      label: "Upcoming",
      value: upcomingCount,
      bgColor: "bg-primary/10"
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      label: "Completed",
      value: completedCount,
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${stat.bgColor} rounded-md`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventStats;