import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { 
  Battery, 
  Search,
  Filter,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  Calendar,
  User,
  FileText,
  TrendingUp
} from 'lucide-react'
import { cn } from '../lib/utils'

interface Transaction {
  id: string
  type: 'sale' | 'purchase' | 'commission' | 'refund'
  batteryId: string
  vehicleInfo: {
    brand: string
    model: string
    vin: string
  }
  amount: number
  commission?: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing'
  date: string
  counterparty: {
    id: string
    name: string
    type: 'buyer' | 'seller' | 'platform'
  }
  paymentMethod: string
  transactionHash?: string
  notes?: string
  documents?: {
    invoice?: string
    receipt?: string
    contract?: string
  }
  ecoImpact: {
    co2Saved: number
    ecoScore: number
  }
}

interface TransactionFilters {
  type: string
  status: string
  dateRange: string
  amountRange: [number, number]
}

const TransactionCard: React.FC<{ 
  transaction: Transaction
  onViewDetails: (transaction: Transaction) => void
}> = ({ transaction, onViewDetails }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sale': return <ArrowUpRight size={16} className="text-emerald-600" />
      case 'purchase': return <ArrowDownLeft size={16} className="text-blue-600" />
      case 'commission': return <DollarSign size={16} className="text-purple-600" />
      case 'refund': return <ArrowDownLeft size={16} className="text-red-600" />
      default: return <Battery size={16} className="text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'failed': return 'bg-red-100 text-red-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={14} />
      case 'pending': return <Clock size={14} />
      case 'processing': return <Clock size={14} />
      case 'failed': return <XCircle size={14} />
      case 'cancelled': return <XCircle size={14} />
      default: return <AlertTriangle size={14} />
    }
  }

  return (
    <Card className="p-6 border-gray-200 bg-white hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            {getTypeIcon(transaction.type)}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {transaction.type}
              </h3>
              <Badge className={getStatusColor(transaction.status)}>
                {getStatusIcon(transaction.status)}
                <span className="ml-1">{transaction.status}</span>
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {transaction.vehicleInfo.brand} {transaction.vehicleInfo.model} • {transaction.vehicleInfo.vin}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar size={12} />
                <span>{new Date(transaction.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User size={12} />
                <span>{transaction.counterparty.name}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className={cn("text-lg font-semibold", 
            transaction.type === 'sale' || transaction.type === 'commission' 
              ? "text-emerald-600" 
              : "text-gray-900"
          )}>
            {transaction.type === 'sale' || transaction.type === 'commission' ? '+' : '-'}
            ₹{transaction.amount.toLocaleString()}
          </div>
          {transaction.commission && (
            <div className="text-sm text-purple-600">
              Commission: ₹{transaction.commission.toLocaleString()}
            </div>
          )}
          <div className="text-xs text-gray-500 mt-1">
            via {transaction.paymentMethod}
          </div>
        </div>
      </div>

      {/* Eco Impact */}
      <div className="bg-emerald-50 p-3 rounded-lg mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Battery size={14} className="text-emerald-600" />
            <span className="text-emerald-700 font-medium">Environmental Impact</span>
          </div>
          <div className="text-emerald-600">
            CO₂ Saved: {transaction.ecoImpact.co2Saved}kg • Score: {transaction.ecoImpact.ecoScore}/10
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {transaction.documents?.invoice && (
            <Button variant="ghost" size="sm">
              <FileText size={14} className="mr-1" />
              Invoice
            </Button>
          )}
          {transaction.transactionHash && (
            <Button variant="ghost" size="sm">
              <span className="text-xs">#{transaction.transactionHash.slice(0, 8)}...</span>
            </Button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => onViewDetails(transaction)}>
          <Eye size={14} className="mr-1" />
          Details
        </Button>
      </div>
    </Card>
  )
}

export const SellerTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    amountRange: [0, 100000]
  })

  // Mock data - Replace with actual API call
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      type: 'sale',
      batteryId: 'bat_001',
      vehicleInfo: {
        brand: 'Tata Motors',
        model: 'Model S 2020',
        vin: '1HGBH41JXMN109186'
      },
      amount: 12500,
      commission: 1250,
      status: 'completed',
      date: '2024-09-25T10:30:00Z',
      counterparty: {
        id: 'buyer_001',
        name: 'John Smith',
        type: 'buyer'
      },
      paymentMethod: 'Credit Card',
      transactionHash: 'tx_abc123def456',
      notes: 'Battery in excellent condition',
      documents: {
        invoice: 'inv_001.pdf',
        receipt: 'rec_001.pdf',
        contract: 'con_001.pdf'
      },
      ecoImpact: {
        co2Saved: 45,
        ecoScore: 8.5
      }
    },
    {
      id: '2',
      type: 'commission',
      batteryId: 'bat_002',
      vehicleInfo: {
        brand: 'BMW',
        model: 'i3 2019',
        vin: '2HGBH41JXMN109187'
      },
      amount: 890,
      status: 'completed',
      date: '2024-09-20T14:15:00Z',
      counterparty: {
        id: 'platform',
        name: 'SmartEV Platform',
        type: 'platform'
      },
      paymentMethod: 'Bank Transfer',
      transactionHash: 'tx_def456ghi789',
      ecoImpact: {
        co2Saved: 32,
        ecoScore: 7.2
      }
    },
    {
      id: '3',
      type: 'purchase',
      batteryId: 'bat_003',
      vehicleInfo: {
        brand: 'Nissan',
        model: 'Leaf 2021',
        vin: '3HGBH41JXMN109188'
      },
      amount: 9800,
      status: 'pending',
      date: '2024-09-18T09:45:00Z',
      counterparty: {
        id: 'seller_002',
        name: 'EV Solutions Inc',
        type: 'seller'
      },
      paymentMethod: 'Wire Transfer',
      ecoImpact: {
        co2Saved: 51,
        ecoScore: 9.1
      }
    },
    {
      id: '4',
      type: 'refund',
      batteryId: 'bat_004',
      vehicleInfo: {
        brand: 'Chevrolet',
        model: 'Bolt 2022',
        vin: '4HGBH41JXMN109189'
      },
      amount: 5500,
      status: 'processing',
      date: '2024-09-15T16:20:00Z',
      counterparty: {
        id: 'buyer_003',
        name: 'Sarah Johnson',
        type: 'buyer'
      },
      paymentMethod: 'Credit Card',
      notes: 'Battery condition not as described',
      ecoImpact: {
        co2Saved: 0,
        ecoScore: 0
      }
    }
  ]

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Replace with actual API call
      // const response = await apiService.getTransactions()
      
      // Simulate API delay
      setTimeout(() => {
        setTransactions(mockTransactions)
        setLoading(false)
      }, 1000)
      
    } catch (err) {
      console.error('Failed to load transactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load transactions')
      setLoading(false)
    }
  }

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowDetails(true)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting transactions...')
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.vehicleInfo.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.vehicleInfo.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.vehicleInfo.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.counterparty.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filters.type === 'all' || transaction.type === filters.type
    const matchesStatus = filters.status === 'all' || transaction.status === filters.status
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Calculate summary statistics
  const totalRevenue = transactions
    .filter(t => t.type === 'sale' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const totalCommissions = transactions
    .filter(t => t.type === 'commission' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)
    
  const totalEcoImpact = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.ecoImpact.co2Saved, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Battery className="animate-spin mx-auto mb-4 text-emerald-600" size={48} />
            <p className="text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-4 text-red-600" size={48} />
            <p className="text-gray-900 font-medium mb-2">Failed to load transactions</p>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadTransactions}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600">Track your sales, purchases, and earnings</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download size={16} className="mr-2" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-emerald-600">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">From completed sales</p>
            </div>
            <ArrowUpRight className="text-emerald-600" size={24} />
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Commissions Earned</p>
              <p className="text-2xl font-bold text-purple-600">₹{totalCommissions.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Platform earnings</p>
            </div>
            <DollarSign className="text-purple-600" size={24} />
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
              <p className="text-xs text-gray-500">Total count</p>
            </div>
            <FileText className="text-blue-600" size={24} />
          </div>
        </Card>

        <Card className="p-6 border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">CO₂ Impact</p>
              <p className="text-2xl font-bold text-green-600">{totalEcoImpact}kg</p>
              <p className="text-xs text-gray-500">Environmental saved</p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6 border-gray-200 bg-white">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="all">All Types</option>
              <option value="sale">Sales</option>
              <option value="purchase">Purchases</option>
              <option value="commission">Commissions</option>
              <option value="refund">Refunds</option>
            </select>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button variant="outline" size="sm">
              <Filter size={16} className="mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Transaction List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredTransactions.length === 0 && (
        <Card className="p-12 border-gray-200 bg-white text-center">
          <FileText className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters</p>
        </Card>
      )}

      {/* Transaction Details Modal */}
      {showDetails && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Transaction Details
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Add detailed transaction view content here */}
              <div className="text-center text-gray-600">
                <p>Detailed transaction information would be displayed here</p>
                <p className="text-sm mt-2">Including payment details, blockchain verification, documents, etc.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
