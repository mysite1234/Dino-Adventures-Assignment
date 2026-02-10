import { Palette, Volume2, Utensils } from 'lucide-react';

const ServiceTag = ({ type }) => {
  const config = {
    decoration: {
      icon: Palette,
      label: 'Decoration',
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    sound: {
      icon: Volume2,
      label: 'Sound',
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    food: {
      icon: Utensils,
      label: 'Food',
      color: 'bg-green-100 text-green-700 border-green-200'
    }
  };

  const { icon: Icon, label, color } = config[type] || config.decoration;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

export default ServiceTag;