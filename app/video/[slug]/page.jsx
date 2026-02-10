import VideoClientPage from './VideoClientPage';
import { videoData } from '@/app/data/VideoData';
// This function tells Next.js which slugs to pre-generate
export async function generateStaticParams() {
  const allVideos = videoData.getAllVideos();
  
  return allVideos.map((video) => ({
    slug: video.slug,
  }));
}

export default function VideoPage({ params }) {
  const videoSlug = params.slug;
  
  // Find the video by slug
  const video = videoData.getVideoById(videoSlug);
  
  if (!video) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Video not found</p>
      </div>
    );
  }

  // Find the category this video belongs to
  const category = videoData.categories.find(cat => 
    cat.contents.some(v => v.slug === videoSlug)
  )?.category;

  return (
    <VideoClientPage 
      video={video}
      category={category}
    />
  );
}