
Video Streaming Platform Documentation
📱 Project Overview
A modern video streaming platform built with Next.js 13.5+ featuring YouTube-like functionality including video playback, category browsing, picture-in-picture mode, and responsive mobile design.

components/
├── atoms/
│   ├── video-player/
│   │   ├── FullScreenPlayer.js    # Fullscreen video player with YouTube integration
│   │   └── MinimizedPlayer.js     # Picture-in-picture draggable player
│   └── video-feed/
│       ├── VideoFeed.js           # Main video feed container
│       ├── CategorySection.js     # Category-based video grouping
│       └── VideoCard.js          # Individual video thumbnail card
└── page.js                       # Default dashboard page

🎬 Video Player Components
1. FullScreenPlayer
The main video player component with comprehensive playback controls.

Features:

🎥 YouTube iframe API integration

▶️ Play/Pause with spacebar

⏪⏩ 10-second skip

🔊 Volume control with mute toggle

📺 Fullscreen mode

⏱️ Progress bar with seek functionality

📋 Related videos suggestions panel

📱 Responsive mobile design

🎯 Like/Dislike functionality

💬 Subtitles toggle

🖼️ Picture-in-Picture minimize

Key Implementation:

javascript
// Global YouTube API state management
let youTubeAPILoaded = false;
let youTubeAPILoading = false;
let youTubeAPIReadyCallbacks = [];

// Player state persistence
const MINIMIZED_PLAYER_KEY = 'minimized_player_state';
Mobile Gestures:

👆 Tap top area → Toggle category info

👆 Tap right 25% → Open related videos

👆 Tap left edge → Open category sidebar (when implemented)

Related Videos Panel:

Automatically loads videos from same category

Desktop: Hover right edge to reveal

Mobile: Tap right side of screen

Click to switch videos instantly

Close button in header and footer

2. MinimizedPlayer (Picture-in-Picture)
Floating mini-player that persists while browsing.

Features:

🎯 YouTube-like draggable mini-player

👆 Smooth mobile drag with velocity physics

📱 Rubber-band effect at screen edges

🎯 Snap-to-corner animation

💾 Persistent position and playback state

▶️ Basic playback controls

🔊 Volume control

🔄 Seamless transition to fullscreen

Drag & Drop Physics:

javascript
// Smooth 60fps dragging with requestAnimationFrame
// Velocity-based fling calculation
// Ease-out cubic bezier snap animation (300ms)
// 30px rubber-band over-drag
State Persistence:

Saves to localStorage (1 hour expiry)

Preserves position, volume, mute, progress

Automatic cleanup on close

🏠 Dashboard Components
1. VideoFeed
Main content aggregator that organizes videos by category.

Props:

categories: Array of category objects with videos

Structure:

javascript
{
  category: {
    slug: string,
    name: string,
    iconUrl: string,
    description?: string,
    tags?: string[]
  },
  contents: Video[]  // Array of videos in category
}
2. CategorySection
Displays a horizontal/vertical grid of videos for a specific category.

Features:

Category header with icon

Responsive 2-column grid (mobile)

Lazy loading ready

Click navigation to video player

3. VideoCard
Individual video thumbnail component.

Features:

🖼️ Thumbnail with hover play overlay

⏱️ Duration badge

🏷️ Category badge

📝 Title with line-clamp

📱 Mobile touch feedback (scale effect)

🔗 Navigation to fullscreen player

📊 Data Flow
text
VideoData (videoData.js)
    ↓
DashboardPage
    ↓
VideoFeed
    ↓
CategorySection
    ↓
VideoCard
    ↓
FullScreenPlayer ←→ MinimizedPlayer
      ↑                    ↓
   YouTube API        localStorage
🔄 Player State Management
Fullscreen → Minimized
User clicks minimize button

savePlayerState() stores current playback state

cleanupPlayer() destroys YouTube instance

Navigate to homepage

MinimizedPlayer reads state from localStorage

Initializes new YouTube player at saved position

Minimized → Fullscreen
User clicks restore button

savePlayerState() updates current state

Sets request_fullscreen flag in localStorage

Navigates to video page

FullScreenPlayer detects flag, enters fullscreen

Seeks to saved timestamp

📱 Responsive Design Breakpoints
Device	Breakpoint	Behavior
Mobile	< 768px	Touch gestures, full-width panels
Tablet	768px - 1024px	Hybrid controls
Desktop	> 1024px	Hover interactions, side panels
🎯 Key Features Implementation
YouTube API Integration
javascript
// Singleton pattern for API loading
const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    // Single script tag, multiple callbacks queue
    // Prevents duplicate API initialization
  });
};
Progress Tracking
500ms interval updates (fullscreen)

1000ms interval updates (minimized)

Buffer progress visualization

Remaining time calculation

Controls Timeout
3 seconds auto-hide (desktop)

Always visible on mobile

Reset on user interaction

🐛 Known Issues & Solutions
Issue: DragOffset ReferenceError
Solution: Add dragOffset to dependency arrays in handleMouseMove and handleTouchMove

Issue: Button Clicks During Drag
Solution: Check e.target.tagName and use e.stopPropagation() on buttons

Issue: Mobile Page Scroll During Drag
Solution: Set touchAction: 'pan-y' and preventDefault() on touchmove

Issue: YouTube API Multiple Initialization
Solution: Global flags youTubeAPILoaded, youTubeAPILoading, callback queue

🚀 Performance Optimizations
useCallback/useMemo - Prevent unnecessary re-renders

requestAnimationFrame - Smooth 60fps animations

Cleanup on unmount - Prevent memory leaks

Lazy YouTube API - Load only when needed

Conditional event listeners - Desktop/mobile specific

Image optimization - Proper sizing, lazy loading ready

📦 Dependencies
json
{
  "next": "13.5.1",
  "react": "^18.2.0",
  "lucide-react": "^0.263.1",
  "tailwindcss": "^3.3.0"
}
🔧 Environment Setup
bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Production
npm start
📁 Data Structure
Video Object
javascript
{
  slug: string,           // Unique identifier
  title: string,          // Video title
  mediaUrl: string,       // YouTube URL
  thumbnailUrl: string,   // Thumbnail image
  mediaType: 'YOUTUBE',   // Media type
  duration?: number       // Optional duration
}
Category Object
javascript
{
  slug: string,           // Unique identifier
  name: string,           // Display name
  iconUrl: string,        // Category icon
  description?: string,   // Category description
  tags?: string[]         // Related tags
}
🎨 Styling Guidelines
Tailwind CSS for utility-first styling

Mobile-first responsive approach

Dark theme with black/dark gray backgrounds

White/red accents for interactive elements

Backdrop blur for overlay panels

Smooth transitions (300ms default)

🔍 Debugging Tips
YouTube API Issues:

Check youtubeId extraction

Verify API script loading

Listen for onError events

State Persistence:

Clear localStorage: localStorage.removeItem(MINIMIZED_PLAYER_KEY)

Check timestamp expiry (1 hour)

Mobile Gestures:

Debug with Chrome DevTools device emulation

Check touch-action CSS property

Verify preventDefault() calls

📈 Future Enhancements
Playlist support

User authentication

Watch history

Video comments

Search functionality

Multiple quality options

Chromecast support

Offline downloads (PWA)

🤝 Contributing
Follow existing component structure

Maintain responsive design patterns

Add proper cleanup in useEffect

Document new features

Test on both desktop and mobile