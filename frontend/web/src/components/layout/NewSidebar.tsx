import React from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  AlertTriangle, 
  ShoppingCart,
  Settings,
  User,
  Bell,
  BarChart3,
  MapPin,
  Battery,
  Recycle,
  Car,
  LogOut
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth, type UserRole } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  roles: UserRole[]
  badge?: number
}

interface SidebarProps {
  isCollapsed?: boolean
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
  userRole?: UserRole
}

const getNavigationByRole = (role: UserRole): NavigationItem[] => {
  const commonItems = [
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['Super Admin', 'Admin', 'Seller'] as UserRole[],
    },
  ]

  switch (role) {
    case 'Super Admin':
      return [
        {
          name: 'Dashboard',
          href: '/super-admin',
          icon: LayoutDashboard,
          roles: ['Super Admin'] as UserRole[],
        },
        {
          name: 'Brand Management',
          href: '/super-admin/brands',
          icon: Building2,
          roles: ['Super Admin'] as UserRole[],
        },
        {
          name: 'Admin Management',
          href: '/super-admin/admins',
          icon: Users,
          roles: ['Super Admin'] as UserRole[],
        },
        {
          name: 'User Management',
          href: '/super-admin/users',
          icon: User,
          roles: ['Super Admin'] as UserRole[],
        },
        {
          name: 'EV Stations',
          href: '/super-admin/stations',
          icon: MapPin,
          roles: ['Super Admin'] as UserRole[],
        },
        {
          name: 'Vehicle & Battery',
          href: '/super-admin/vehicles',
          icon: Car,
          roles: ['Super Admin'] as UserRole[],
        },
        {
          name: 'Complaints',
          href: '/super-admin/complaints',
          icon: AlertTriangle,
          roles: ['Super Admin'] as UserRole[],
          badge: 8,
        },
        {
          name: 'Analytics',
          href: '/super-admin/analytics',
          icon: BarChart3,
          roles: ['Super Admin'] as UserRole[],
        },
        ...commonItems,
      ]

    case 'Admin':
      return [
        {
          name: 'Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
          roles: ['Admin'] as UserRole[],
        },
        {
          name: 'User Management',
          href: '/admin/users',
          icon: Users,
          roles: ['Admin'] as UserRole[],
        },
        {
          name: 'Vehicle & Battery',
          href: '/admin/vehicles',
          icon: Car,
          roles: ['Admin'] as UserRole[],
        },
        {
          name: 'EV Stations',
          href: '/admin/stations',
          icon: MapPin,
          roles: ['Admin'] as UserRole[],
        },
        {
          name: 'Analytics',
          href: '/admin/analytics',
          icon: BarChart3,
          roles: ['Admin'] as UserRole[],
        },
        {
          name: 'Complaints',
          href: '/admin/complaints',
          icon: AlertTriangle,
          roles: ['Admin'] as UserRole[],
          badge: 3,
        },
        ...commonItems,
      ]

    case 'Seller':
      return [
        {
          name: 'Dashboard',
          href: '/seller',
          icon: LayoutDashboard,
          roles: ['Seller'] as UserRole[],
        },
        {
          name: 'Marketplace',
          href: '/seller/marketplace',
          icon: ShoppingCart,
          roles: ['Seller'] as UserRole[],
        },
        {
          name: 'Transactions',
          href: '/seller/transactions',
          icon: Battery,
          roles: ['Seller'] as UserRole[],
        },
        {
          name: 'Eco Analytics',
          href: '/seller/eco-analytics',
          icon: Recycle,
          roles: ['Seller'] as UserRole[],
        },
        ...commonItems,
      ]

    default:
      return commonItems
  }
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  isMobile = false,
  isOpen = true,
  onClose,
  userRole = 'Admin',
}) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = getNavigationByRole(userRole)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (isMobile && !isOpen) {
    return null
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'flex flex-col bg-white border-r border-gray-200',
          isMobile
            ? 'fixed left-0 top-0 h-full w-72 z-50 lg:hidden'
            : cn(
                'hidden lg:flex',
                isCollapsed ? 'w-16' : 'w-72'
              ),
          'transition-all duration-300 ease-in-out'
        )}
      >
        {/* Logo/Brand */}
        <div className={cn(
          'flex items-center px-6 py-4 border-b border-gray-200',
          isCollapsed && !isMobile && 'px-4'
        )}>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Battery className="text-white" size={20} />
            </div>
            {(!isCollapsed || isMobile) && (
              <div>
                <h2 className="text-lg font-bold text-gray-900">SmartEV</h2>
                <p className="text-xs text-gray-600">Lifecycle Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* User info */}
        <div className={cn(
          'px-6 py-4 border-b border-gray-200',
          isCollapsed && !isMobile && 'px-4'
        )}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="text-gray-600" size={20} />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                    {user?.role}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
            
            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={isMobile ? onClose : undefined}
                className={cn(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                  isCollapsed && !isMobile && 'justify-center px-2'
                )}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {(!isCollapsed || isMobile) && (
                  <>
                    <span className="ml-3 flex-1">{item.name}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge
                        variant="destructive"
                        className="ml-auto bg-red-100 text-red-700 text-xs px-1.5 py-0.5"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Notifications (if not collapsed) */}
        {(!isCollapsed || isMobile) && (
          <div className="px-4 py-3 border-t border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Bell size={16} className="mr-2" />
              Notifications
              <Badge variant="destructive" className="ml-auto bg-red-100 text-red-700 text-xs">
                3
              </Badge>
            </Button>
          </div>
        )}

        {/* Settings and Logout */}
        <div className={cn(
          'px-4 py-4 border-t border-gray-200 space-y-2',
          isCollapsed && !isMobile && 'px-2'
        )}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100',
              isCollapsed && !isMobile ? 'justify-center px-2' : 'justify-start'
            )}
          >
            <Settings size={16} className={!isCollapsed || isMobile ? 'mr-2' : ''} />
            {(!isCollapsed || isMobile) && 'Settings'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className={cn(
              'w-full text-red-600 hover:text-red-700 hover:bg-red-50',
              isCollapsed && !isMobile ? 'justify-center px-2' : 'justify-start'
            )}
          >
            <LogOut size={16} className={!isCollapsed || isMobile ? 'mr-2' : ''} />
            {(!isCollapsed || isMobile) && 'Logout'}
          </Button>
        </div>
      </div>
    </>
  )
}