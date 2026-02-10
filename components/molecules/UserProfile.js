import Avatar from '@/components/atoms/Avatar';
import Text from '@/components/atoms/Text';

export default function UserProfile({ 
  name, 
  email, 
  avatar, 
  size = 'md',
  showEmail = true 
}) {
  return (
    <div className="flex items-center gap-3">
      <Avatar 
        src={avatar} 
        alt={name} 
        size={size}
      />
      <div className="flex-1 min-w-0">
        <Text variant="small" className="font-medium text-gray-900 truncate">
          {name}
        </Text>
        {showEmail && (
          <Text variant="caption" className="truncate">
            {email}
          </Text>
        )}
      </div>
    </div>
  );
}