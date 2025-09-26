import React from 'react'
import { 
  Search,
  Bell,
  ChevronDown,
  Menu
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface HeaderProps {
  user?: {
    name: string
    role: string
    avatar?: string
  }
  onMenuToggle?: () => void
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onMenuToggle
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6">
      <div className="flex h-16 items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </Button>
          
          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="text-gray-600" size={16} />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-100 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Bell size={20} />
            <Badge className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center p-0">
              3
            </Badge>
          </Button>

          {/* User menu */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{user.role}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-700 text-sm font-medium">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <ChevronDown className="text-gray-600" size={16} />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}