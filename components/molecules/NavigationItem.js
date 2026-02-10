'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Text from '@/components/atoms/Text';
import Icon from '@/components/atoms/Icon';
import ChevronIcon from '@/components/atoms/ChevronIcon';

export default function NavigationItem({ 
  href, 
  children, 
  icon, 
  className,
  hasSubmenu = false,
  submenuItems = [],
  level = 0,
  isCollapsed = false
}) {
  const pathname = usePathname();
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const isActive = pathname === href || submenuItems.some(item => pathname === item.href);
  const isCurrentPage = pathname === href;

  const handleClick = (e) => {
    if (hasSubmenu) {
      e.preventDefault();
      setIsSubmenuOpen(!isSubmenuOpen);
    }
  };

  const paddingLeft = level === 0 ? 'pl-3' : level === 1 ? 'pl-8' : 'pl-12';

  return (
    <div className="w-full">
      <div
        className={cn(
          'flex items-center justify-between w-full py-2 px-3 rounded-lg transition-all duration-200 ease-in-out group cursor-pointer',
          'hover:bg-gray-100 hover:shadow-sm',
          isCurrentPage && 'bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-sm',
          isActive && !isCurrentPage && 'bg-gray-50',
          level > 0 && 'mx-2',
          className
        )}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {level === 0 && icon && (
            <div className={cn(
              'flex-shrink-0 transition-all duration-200',
              isCollapsed ? 'mx-auto' : ''
            )}>
              <Icon 
                icon={icon} 
                size={18} 
                className={cn(
                  'transition-colors duration-200',
                  isCurrentPage ? 'text-blue-700' : 'text-gray-600 group-hover:text-gray-900'
                )}
              />
            </div>
          )}
          
          {level > 0 && (
            <div className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0 transition-colors duration-200 group-hover:bg-gray-600" />
          )}

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              {hasSubmenu ? (
                <Text 
                  variant="small" 
                  className={cn(
                    'font-medium transition-colors duration-200 truncate',
                    isCurrentPage ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                  )}
                >
                  {children}
                </Text>
              ) : (
                <Link href={href} className="block w-full">
                  <Text 
                    variant="small" 
                    className={cn(
                      'font-medium transition-colors duration-200 truncate',
                      isCurrentPage ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'
                    )}
                  >
                    {children}
                  </Text>
                </Link>
              )}
            </div>
          )}
        </div>

        {hasSubmenu && !isCollapsed && (
          <div className="flex-shrink-0 ml-2">
            <ChevronIcon 
              isOpen={isSubmenuOpen}
              className={cn(
                'transition-colors duration-200',
                isCurrentPage ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'
              )}
            />
          </div>
        )}
      </div>

      {/* Submenu */}
      {hasSubmenu && !isCollapsed && (
        <div className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isSubmenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="py-1 space-y-1">
            {submenuItems.map((item, index) => (
              <NavigationItem
                key={item.href || index}
                href={item.href}
                level={level + 1}
                hasSubmenu={item.submenuItems && item.submenuItems.length > 0}
                submenuItems={item.submenuItems || []}
                isCollapsed={isCollapsed}
              >
                {item.label}
              </NavigationItem>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}