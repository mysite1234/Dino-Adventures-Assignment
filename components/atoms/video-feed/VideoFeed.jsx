'use client';

import CategorySection from './CategorySection';

export default function VideoFeed({ categories=[] }) {
  return (
    <div className="pb-24">
      {categories.map(({ category, contents }) => (
        <CategorySection
          key={category.slug}
          category={category}
          videos={contents}
        />
      ))}
    </div>
  );
}