import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import inventoryService from '@/services/api/inventoryService'
import vaccineService from '@/services/api/vaccineService'
import SearchBar from '@/components/molecules/SearchBar'
import StatusBadge from '@/components/atoms/StatusBadge'
import Button from '@/components/atoms/Button'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import ApperIcon from '@/components/ApperIcon'

const Inventory = () => {
  const [inventory, setInventory] = useState([])
  const [vaccines, setVaccines] = useState([])
  const [filteredInventory, setFilteredInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('expirationDate')
  const [sortDirection, setSortDirection] = useState('asc')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Advanced filter states
  const [filters, setFilters] = useState({
    vaccineFamily: '',
    vaccineName: '',
    lotId: '',
    expirationDateFrom: '',
    expirationDateTo: '',
    quantityMin: '',
    quantityMax: ''
  })
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [inventoryData, vaccineData] = await Promise.all([
        inventoryService.getAll(),
        vaccineService.getAll()
      ])
      
      setInventory(inventoryData)
      setVaccines(vaccineData)
      
    } catch (err) {
      setError(err.message || 'Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [])
  
useEffect(() => {
    let filtered = [...inventory]
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const vaccine = vaccines.find(v => v.vaccineId === item.vaccineId)
        const searchFields = [
          vaccine?.commercialName || '',
          vaccine?.genericName || '',
          vaccine?.vaccineFamily || '',
          item.lotNumber,
          item.status
        ].join(' ').toLowerCase()
        
        return searchFields.includes(searchTerm.toLowerCase())
      })
    }
    
    // Apply advanced filters
    if (filters.vaccineFamily) {
      filtered = filtered.filter(item => {
        const vaccine = vaccines.find(v => v.vaccineId === item.vaccineId)
        return vaccine?.vaccineFamily?.toLowerCase().includes(filters.vaccineFamily.toLowerCase())
      })
    }
    
    if (filters.vaccineName) {
      filtered = filtered.filter(item => {
        const vaccine = vaccines.find(v => v.vaccineId === item.vaccineId)
        const nameFields = [
          vaccine?.commercialName || '',
          vaccine?.genericName || ''
        ].join(' ').toLowerCase()
        return nameFields.includes(filters.vaccineName.toLowerCase())
      })
    }
    
    if (filters.lotId) {
      filtered = filtered.filter(item => 
        item.lotNumber.toLowerCase().includes(filters.lotId.toLowerCase())
      )
    }
    
    if (filters.expirationDateFrom) {
      const fromDate = new Date(filters.expirationDateFrom)
      filtered = filtered.filter(item => 
        new Date(item.expirationDate) >= fromDate
      )
    }
    
    if (filters.expirationDateTo) {
      const toDate = new Date(filters.expirationDateTo)
      filtered = filtered.filter(item => 
        new Date(item.expirationDate) <= toDate
      )
    }
    
    if (filters.quantityMin) {
      filtered = filtered.filter(item => 
        item.quantityOnHand >= parseInt(filters.quantityMin)
      )
    }
    
    if (filters.quantityMax) {
      filtered = filtered.filter(item => 
        item.quantityOnHand <= parseInt(filters.quantityMax)
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        const today = new Date()
        const expirationDate = new Date(item.expirationDate)
        const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24))
        
        switch (statusFilter) {
          case 'expiring':
            return daysUntilExpiration <= 30 && daysUntilExpiration > 0
          case 'expired':
            return daysUntilExpiration <= 0
          case 'low-stock':
            return item.quantityOnHand <= 20 && item.quantityOnHand > 0
          case 'good':
            return daysUntilExpiration > 30 && item.quantityOnHand > 20
          default:
            return true
        }
      })
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue
      
      switch (sortField) {
        case 'vaccineName':
          const aVaccine = vaccines.find(v => v.vaccineId === a.vaccineId)
          const bVaccine = vaccines.find(v => v.vaccineId === b.vaccineId)
          aValue = aVaccine?.commercialName || ''
          bValue = bVaccine?.commercialName || ''
          break
        case 'expirationDate':
          aValue = new Date(a.expirationDate)
          bValue = new Date(b.expirationDate)
          break
        case 'quantityOnHand':
          aValue = a.quantityOnHand
          bValue = b.quantityOnHand
          break
        default:
          aValue = a[sortField] || ''
          bValue = b[sortField] || ''
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    setFilteredInventory(filtered)
  }, [inventory, vaccines, searchTerm, sortField, sortDirection, statusFilter, filters])
  
  const getStatusInfo = (item) => {
    const today = new Date()
    const expirationDate = new Date(item.expirationDate)
    const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiration <= 0) {
      return { status: 'expired', text: 'Expired' }
    } else if (daysUntilExpiration <= 30) {
      return { status: 'expiring', text: `Expires in ${daysUntilExpiration} days` }
    } else if (item.quantityOnHand <= 20) {
      return { status: 'low-stock', text: 'Low Stock' }
    } else {
      return { status: 'good', text: 'Good' }
    }
  }
  
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
}
  
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  const clearAllFilters = () => {
    setFilters({
      vaccineFamily: '',
      vaccineName: '',
      lotId: '',
      expirationDateFrom: '',
      expirationDateTo: '',
      quantityMin: '',
      quantityMax: ''
    })
    setSearchTerm('')
    setStatusFilter('all')
  }
  
  const getActiveFilterCount = () => {
    let count = 0
    if (searchTerm) count++
    if (statusFilter !== 'all') count++
    Object.values(filters).forEach(value => {
      if (value) count++
    })
    return count
  }
  
  const getUniqueVaccineFamilies = () => {
    const families = vaccines.map(v => v.vaccineFamily).filter(Boolean)
    return [...new Set(families)].sort()
  }
  
  if (loading) return <Loading type="table" />
  if (error) return <Error message={error} onRetry={loadData} />
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Track vaccine inventory with expiration and stock alerts</p>
        </div>
      </div>
      
{/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1">
            <SearchBar
              onSearch={setSearchTerm}
              placeholder="Search by vaccine name, lot number, or status..."
              className="w-full"
              value={searchTerm}
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="good">Good</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
              <option value="low-stock">Low Stock</option>
            </select>
            <Button
              variant="outline"
              icon={showAdvancedFilters ? "ChevronUp" : "ChevronDown"}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              Advanced Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
            </Button>
            <Button
              variant="outline"
              icon="RefreshCw"
              onClick={loadData}
            >
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccine Family
                </label>
                <select
                  value={filters.vaccineFamily}
                  onChange={(e) => handleFilterChange('vaccineFamily', e.target.value)}
                  className="input-field"
                >
                  <option value="">All Families</option>
                  {getUniqueVaccineFamilies().map(family => (
                    <option key={family} value={family}>{family}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccine Name
                </label>
                <input
                  type="text"
                  value={filters.vaccineName}
                  onChange={(e) => handleFilterChange('vaccineName', e.target.value)}
                  placeholder="Filter by vaccine name..."
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lot ID
                </label>
                <input
                  type="text"
                  value={filters.lotId}
                  onChange={(e) => handleFilterChange('lotId', e.target.value)}
                  placeholder="Filter by lot ID..."
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date From
                </label>
                <input
                  type="date"
                  value={filters.expirationDateFrom}
                  onChange={(e) => handleFilterChange('expirationDateFrom', e.target.value)}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiration Date To
                </label>
                <input
                  type="date"
                  value={filters.expirationDateTo}
                  onChange={(e) => handleFilterChange('expirationDateTo', e.target.value)}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.quantityMin}
                    onChange={(e) => handleFilterChange('quantityMin', e.target.value)}
                    placeholder="Min"
                    className="input-field flex-1"
                    min="0"
                  />
                  <input
                    type="number"
                    value={filters.quantityMax}
                    onChange={(e) => handleFilterChange('quantityMax', e.target.value)}
                    placeholder="Max"
                    className="input-field flex-1"
                    min="0"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                icon="X"
                onClick={clearAllFilters}
              >
                Clear All Filters
              </Button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Inventory Table */}
      <div className="card">
        {filteredInventory.length === 0 ? (
          <Empty
            icon="Package"
            title="No Inventory Found"
            description="No vaccines match your current filters. Try adjusting your search or filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('vaccineName')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Vaccine</span>
                      <ApperIcon 
                        name={sortField === 'vaccineName' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        size={16} 
                      />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('lotNumber')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Lot Number</span>
                      <ApperIcon 
                        name={sortField === 'lotNumber' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        size={16} 
                      />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('expirationDate')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Expiration Date</span>
                      <ApperIcon 
                        name={sortField === 'expirationDate' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        size={16} 
                      />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('quantityOnHand')}
                      className="flex items-center space-x-1 hover:text-gray-700"
                    >
                      <span>Quantity On Hand</span>
                      <ApperIcon 
                        name={sortField === 'quantityOnHand' ? (sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown') : 'ChevronsUpDown'} 
                        size={16} 
                      />
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item, index) => {
                  const vaccine = vaccines.find(v => v.vaccineId === item.vaccineId)
                  const statusInfo = getStatusInfo(item)
                  
                  return (
                    <motion.tr
                      key={item.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {vaccine?.commercialName || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {vaccine?.genericName || 'Unknown'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.lotNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.expirationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantityOnHand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={statusInfo.status}>
                          {statusInfo.text}
                        </StatusBadge>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inventory