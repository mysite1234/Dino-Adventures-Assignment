'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/organisms/Header';
import Sidebar from '@/components/organisms/Sidebar';
import { Toaster } from 'sonner';
import MinimizedPlayer from '../atoms/video-player/MiniPlayer';
export default function MainLayout({ children }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if current route is a video player route
  const isVideoRoute = pathname?.startsWith('/video/');

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(auth);
    setIsLoading(false);
  }, []);

  // ⏳ Wait until client is ready
  if (isLoading) {
    return null;
  }

  // 🔐 Render Login directly
  /* if (!isAuthenticated) {
    return <AuthPage />;
  } */

  const user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar:
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
  };

  // 🎬 For video routes - show ONLY the video player, NO layout
  if (isVideoRoute) {
    return (
      <>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand
          visibleToasts={5}
        />
      </>
    );
  }

  // 📱 For non-video routes - show full layout with sidebar
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />

         {/* Minimized player will appear if there's a video playing */}
      <MinimizedPlayer />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>

      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        visibleToasts={5}
      />
    </div>
  );
}