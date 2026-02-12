'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, Settings, LogOut } from 'lucide-react';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import SearchBox from '@/components/molecules/SearchBox';
import UserProfile from '@/components/molecules/UserProfile';

export default function Header({ onMenuClick, user }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter(); // ✅ Next.js App Router navigation

  const handleToggle = () => setDropdownOpen((prev) => !prev);

  const handleSignOut = () => {
    setDropdownOpen(false);
    window.location.reload();
    localStorage.removeItem('token');
    localStorage.setItem("isAuthenticated", "false");

  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Icon icon={Menu} size={20} />
          </Button>

          <Text variant="h4" as="h1" className="text-gray-900">
            Dashboard
          </Text>
        </div>

        <div className="hidden md:block flex-1 max-w-md mx-8">
          <SearchBox placeholder="Search anything..." />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Icon icon={Bell} size={18} />
          </Button>
          <Button variant="ghost" size="sm">
            <Icon icon={Settings} size={18} />
          </Button>

          <div className="relative ml-4 pl-4 border-l border-gray-200">
            <div onClick={handleToggle} className="cursor-pointer">
              <UserProfile
                name={user?.name || 'John Doe'}
                email={user?.email || 'john@example.com'}
                avatar="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150"
                size="sm"
                showEmail={false}
              />
            </div>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Icon icon={LogOut} size={16} className="mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
