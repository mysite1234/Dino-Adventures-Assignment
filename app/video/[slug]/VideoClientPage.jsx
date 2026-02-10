'use client';
import FullScreenPlayer from "@/components/atoms/video-player/FullScreenPlayer";

export default function VideoClientPage({ video, category }) {
  return (
    <FullScreenPlayer 
      video={video}
      category={category}
    />
  );
}