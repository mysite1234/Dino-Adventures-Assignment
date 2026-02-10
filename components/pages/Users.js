import Text from '@/components/atoms/Text';
import StatsGrid from '@/components/organisms/StatsGrid';
import RecentActivity from '@/components/organisms/RecentActivity';
import Card, { CardHeader, CardContent } from '@/components/molecules/Card';

export default function Users() {
  return (
    <div className="space-y-6">
      <div>
        <Text variant="h2" className="text-gray-900">
          Welcome back, John!
        </Text>
        <Text variant="body" className="text-gray-600 mt-1">
          Here's what's happening with your projects today.
        </Text>
      </div>

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        
        <Card>
          <CardHeader>
            <Text variant="h5" className="text-gray-900">
              Quick Actions
            </Text>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Text variant="small" className="font-medium text-gray-900">
                Create New Project
              </Text>
              <Text variant="caption" className="text-gray-600 mt-1">
                Start a new project from scratch or use a template
              </Text>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Text variant="small" className="font-medium text-gray-900">
                Invite Team Members
              </Text>
              <Text variant="caption" className="text-gray-600 mt-1">
                Add new team members to collaborate on projects
              </Text>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Text variant="small" className="font-medium text-gray-900">
                View Reports
              </Text>
              <Text variant="caption" className="text-gray-600 mt-1">
                Check detailed analytics and performance reports
              </Text>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}