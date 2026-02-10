import VideoCard from './VideoCard';

export default function CategorySection({ category, videos }) {
  return (
    <div className="mb-8">
      {/* Category Header */}
      <div className="flex items-center gap-2 px-4 mb-3">
        <img 
          src={category.iconUrl} 
          alt={category.name}
          className="w-6 h-6"
        />
        <h2 className="text-lg font-semibold">{category.name}</h2>
      </div>
      
      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-3 px-4">
        {videos.map(video => (
          <VideoCard 
            key={video.slug}
            video={video}
            category={category}
          />
        ))}
      </div>
    </div>
  );
}