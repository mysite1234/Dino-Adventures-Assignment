'use client';

import { useState } from 'react';
import { 
  Home, 
  Users, 
  BarChart, 
  Settings, 
  FileText, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  UserPlus,
  Activity,
  TrendingUp,
  PieChart,
  Building,
  CreditCard,
  Bell,
  Lock,
  Palette,
  Database,
  CalendarCheck,
  Building2
} from 'lucide-react';
import Text from '@/components/atoms/Text';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';
import NavigationItem from '@/components/molecules/NavigationItem';
import { cn } from '@/lib/utils';

const navigationItems = [
  { 
    href: '/', 
    label: 'Dashboard', 
    icon: Home 
  },
  /* { 
    href: '/customers', 
    label: 'Demo Video', 
    icon: CalendarCheck 
  }, */
 
/*   { 
    href: '/users', 
    label: 'Users', 
    icon: Users,
    hasSubmenu: true,
    submenuItems: [
      { href: '/users/all', label: 'All Users' },
      { href: '/users/active', label: 'Active Users' },
      { href: '/users/permissions', label: 'Permissions', icon: Shield },
      { 
        href: '/users/management', 
        label: 'Management',
        hasSubmenu: true,
        submenuItems: [
          { href: '/users/management/roles', label: 'User Roles' },
          { href: '/users/management/groups', label: 'User Groups' },
          { href: '/users/management/invites', label: 'Invitations' }
        ]
      }
    ]
  }, */
 /*  { 
    href: '/analytics', 
    label: 'Analytics', 
    icon: BarChart,
    hasSubmenu: true,
    submenuItems: [
      { href: '/analytics/overview', label: 'Overview', icon: Activity },
      { href: '/analytics/trends', label: 'Trends', icon: TrendingUp },
      { href: '/analytics/reports', label: 'Custom Reports', icon: PieChart },
      { 
        href: '/analytics/advanced', 
        label: 'Advanced',
        hasSubmenu: true,
        submenuItems: [
          { href: '/analytics/advanced/cohorts', label: 'Cohort Analysis' },
          { href: '/analytics/advanced/funnels', label: 'Funnel Analysis' },
          { href: '/analytics/advanced/retention', label: 'Retention Analysis' }
        ]
      }
    ]
  }, */
  /* { 
    href: '/reports', 
    label: 'Reports', 
    icon: FileText,
    hasSubmenu: true,
    submenuItems: [
      { href: '/reports/financial', label: 'Financial Reports' },
      { href: '/reports/user-activity', label: 'User Activity' },
      { href: '/reports/performance', label: 'Performance' }
    ]
  }, */
 /*  { 
    href: '/calendar', 
    label: 'Calendar', 
    icon: Calendar 
  },
  { 
    href: '/settings', 
    label: 'Settings', 
    icon: Settings,
    hasSubmenu: true,
    submenuItems: [
      { href: '/settings/general', label: 'General', icon: Settings },
      { href: '/settings/notifications', label: 'Notifications', icon: Bell },
      { href: '/settings/security', label: 'Security', icon: Lock },
      { href: '/settings/appearance', label: 'Appearance', icon: Palette },
      { 
        href: '/settings/advanced', 
        label: 'Advanced',
        hasSubmenu: true,
        submenuItems: [
          { href: '/settings/advanced/api', label: 'API Settings' },
          { href: '/settings/advanced/database', label: 'Database', icon: Database },
          { href: '/settings/advanced/integrations', label: 'Integrations' }
        ]
      }
    ]
  }, */
];

export default function Sidebar({ isOpen, onClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const shouldShowContent = !isCollapsed || isHovered;
  const sidebarWidth = shouldShowContent ? 'w-64' : 'w-16';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 lg:hidden z-20 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          'fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-lg lg:shadow-none',
          sidebarWidth,
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            {shouldShowContent ? (
              <>
                <Text variant="h5" className="text-blue-600 font-bold tracking-wide">
                  AtomicUI
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="hidden lg:flex hover:bg-blue-100 text-blue-600"
                >
                  <Icon icon={isCollapsed ? ChevronRight : ChevronLeft} size={16} />
                </Button>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Text variant="small" className="text-white font-bold">
                    A
                  </Text>
                </div>
              </div>
            )}
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                hasSubmenu={item.hasSubmenu}
                submenuItems={item.submenuItems}
                isCollapsed={isCollapsed && !isHovered}
              >
                {item.label}
              </NavigationItem>
            ))}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {shouldShowContent ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                <Text variant="small" className="font-medium text-blue-900">
                  Need help?
                </Text>
                <Text variant="caption" className="text-blue-700 mt-1 leading-relaxed">
                  Check our documentation for guides and tutorials.
                </Text>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  View Docs
                </Button>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon icon={FileText} size={16} className="text-blue-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}