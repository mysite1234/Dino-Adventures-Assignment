'use client';

import { useRouter } from 'next/navigation';

export default function VideoCard({ video, category }) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/video/${video.slug}`);
  };

  return (
    <div 
      className="bg-gray-900 rounded-lg overflow-hidden mb-4 active:scale-[0.98] transition-transform cursor-pointer"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative">
        <img 
          src={video.thumbnailUrl} 
          alt={video.title}
          className="w-full aspect-video object-cover"
        />
        {/* Duration Badge */}
        <span className="absolute bottom-2 right-2 bg-black/80 text-xs px-1.5 py-0.5 rounded">
          5:30
        </span>
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-black/50 p-3 rounded-full">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Video Info */}
      <div className="p-3">
        {/* Category Badge */}
        <span className="inline-block bg-purple-600 text-xs px-2 py-1 rounded mb-2">
          {category.name}
        </span>
        
        {/* Title */}
        <h3 className="font-medium text-white line-clamp-2">
  {video.title}
</h3>      </div>
    </div>
  );
}