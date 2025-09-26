import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './NewSidebar'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

interface LayoutProps {
  children?: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(false) // Always expand on mobile
        setMobileMenuOpen(false) // Close mobile menu
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSidebarToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false)
  }

  if (!user) {
    return null // This should be handled by ProtectedRoute, but safety check
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <Sidebar
          isCollapsed={sidebarCollapsed}
          userRole={user.role}
        />
      )}

      {/* Sidebar - Mobile */}
      {isMobile && (
        <Sidebar
          isMobile={true}
          isOpen={mobileMenuOpen}
          onClose={handleMobileMenuClose}
          userRole={user.role}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSidebarToggle}
              className="lg:hidden text-zinc-400 hover:text-zinc-100"
            >
              ☰
            </button>
            <h1 className="text-xl font-semibold text-zinc-100">SmartEV Platform</h1>
          </div>
          {user && (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-zinc-100">{user.name}</p>
                <p className="text-xs text-zinc-400">{user.role}</p>
              </div>
            </div>
          )}
        </div>

        {/* Page content */}
        <main 
          className={cn(
            'flex-1 overflow-y-auto',
            'px-4 lg:px-6 py-6',
            'max-w-7xl mx-auto w-full'
          )}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

// Page wrapper component for consistent spacing and max width
export const PageWrapper: React.FC<{ 
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}> = ({ children, title, description, actions }) => {
  return (
    <div className="space-y-6">
      {/* Page header */}
      {(title || description || actions) && (
        <div className="flex items-start justify-between">
          <div>
            {title && (
              <h1 className="text-2xl font-semibold text-zinc-100">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-zinc-400">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Page content */}
      <div>{children}</div>
    </div>
  )
}