import { TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react';
import Card, { CardContent } from '@/components/molecules/Card';
import Text from '@/components/atoms/Text';
import Icon from '@/components/atoms/Icon';

const stats = [
  {
    title: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    title: 'Active Users',
    value: '2,350',
    change: '+180.1%',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Sales',
    value: '12,234',
    change: '+19%',
    changeType: 'positive',
    icon: ShoppingCart,
  },
  {
    title: 'Growth',
    value: '+573',
    change: '+201%',
    changeType: 'positive',
    icon: TrendingUp,
  },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="flex items-center justify-between">
            <div>
              <Text variant="caption" className="text-gray-600">
                {stat.title}
              </Text>
              <Text variant="h3" className="text-gray-900 mt-1">
                {stat.value}
              </Text>
              <div className="flex items-center mt-2">
                <Text 
                  variant="caption" 
                  className={`font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </Text>
                <Text variant="caption" className="text-gray-500 ml-1">
                  from last month
                </Text>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Icon icon={stat.icon} size={24} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}