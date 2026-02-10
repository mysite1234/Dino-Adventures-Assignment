import Text from '@/components/atoms/Text';
import StatsGrid from '@/components/organisms/StatsGrid';
import RecentActivity from '@/components/organisms/RecentActivity';
import Card, { CardHeader, CardContent } from '@/components/molecules/Card';
import VideoFeed from '../atoms/video-feed/VideoFeed';
import { videoData } from '@/app/data/VideoData';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <VideoFeed categories={videoData.categories}></VideoFeed>
    </div>
  );
}