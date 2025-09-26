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
    <header className="bg-zinc-900 border-b border-zinc-800 px-4 lg:px-6">
      <div className="flex h-16 items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </Button>
          
          {/* Search bar - hidden on mobile */}
          <div className="hidden md:block relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="text-zinc-400" size={16} />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
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
                <p className="text-sm font-medium text-zinc-100">{user.name}</p>
                <p className="text-xs text-zinc-400">{user.role}</p>
              </div>
              <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center">
                <span className="text-zinc-300 text-sm font-medium">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <ChevronDown className="text-zinc-400" size={16} />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}