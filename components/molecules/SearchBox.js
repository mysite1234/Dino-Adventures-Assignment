'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import Input from '@/components/atoms/Input';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

export default function SearchBox({ placeholder = 'Search...', onSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <div className="relative flex-1">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Icon icon={Search} size={16} className="text-gray-400" />
        </div>
      </div>
      <Button 
        type="submit" 
        className="ml-2"
        disabled={!query.trim()}
      >
        Search
      </Button>
    </form>
  );
}