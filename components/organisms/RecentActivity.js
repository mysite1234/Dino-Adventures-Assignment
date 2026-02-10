import Card, { CardHeader, CardContent } from '@/components/molecules/Card';
import Text from '@/components/atoms/Text';
import UserProfile from '@/components/molecules/UserProfile';

const activities = [
  {
    id: 1,
    user: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    action: 'Created a new project',
    timestamp: '2 minutes ago',
  },
  {
    id: 2,
    user: {
      name: 'Mike Chen',
      email: 'mike@example.com',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    action: 'Updated user settings',
    timestamp: '5 minutes ago',
  },
  {
    id: 3,
    user: {
      name: 'Emily Davis',
      email: 'emily@example.com',
      avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    action: 'Completed a task',
    timestamp: '10 minutes ago',
  },
  {
    id: 4,
    user: {
      name: 'Alex Thompson',
      email: 'alex@example.com',
      avatar: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
    },
    action: 'Joined the team',
    timestamp: '1 hour ago',
  },
];

export default function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <Text variant="h5" className="text-gray-900">
          Recent Activity
        </Text>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3 flex-1">
              <UserProfile
                name={activity.user.name}
                email={activity.user.email}
                avatar={activity.user.avatar}
                size="sm"
                showEmail={false}
              />
              <div className="flex-1">
                <Text variant="small" className="text-gray-900">
                  {activity.action}
                </Text>
              </div>
            </div>
            <Text variant="caption" className="text-gray-500">
              {activity.timestamp}
            </Text>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}