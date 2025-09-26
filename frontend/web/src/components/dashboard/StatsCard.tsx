import React, { useMemo } from 'react'
import { cn } from '../../lib/utils'
import { Card } from '../ui/Card'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
  }
  icon?: React.ReactNode
  trend?: Array<{ value: number; label?: string }>
  className?: string
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  trend,
  className,
}) => {
  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return 'text-success-600'
      case 'decrease':
        return 'text-error-600'
      default:
        return 'text-neutral-500'
    }
  }

  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return '↗'
      case 'decrease':
        return '↘'
      default:
        return '→'
    }
  }

  const maxTrendValue = useMemo(() => {
    if (!trend || trend.length === 0) return 0
    return trend.reduce((max, point) => Math.max(max, point.value), 0)
  }, [trend])

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600">{title}</p>
          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-semibold text-neutral-900">{value}</p>
            {change && (
              <p className={cn('ml-2 text-sm font-medium', getChangeColor(change.type))}>
                <span className="inline-flex items-center">
                  {getChangeIcon(change.type)}
                  {Math.abs(change.value)}%
                </span>
              </p>
            )}
          </div>
        </div>

        {icon && (
          <div className="flex-shrink-0">
            <div className="p-3 bg-primary-50 rounded-lg">
              {React.isValidElement(icon) ? icon : <span className="text-primary-600 text-xl">{icon}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Mini trend chart */}
      {trend && trend.length > 0 && (
        <div className="mt-4">
          <div className="flex items-end space-x-1 h-8">
            {trend.map((point, index) => {
              const height = maxTrendValue > 0 ? (point.value / maxTrendValue) * 100 : 0
              return (
                <div
                  key={index}
                  className="bg-primary-200 rounded-sm flex-1 min-w-0 transition-all duration-300 hover:bg-primary-300"
                  style={{ height: `${height}%` }}
                  title={`${point.value}${point.label ? ` ${point.label}` : ''}`}
                />
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}