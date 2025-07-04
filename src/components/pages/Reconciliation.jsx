import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import inventoryService from '@/services/api/inventoryService'
import vaccineService from '@/services/api/vaccineService'
import reconciliationService from '@/services/api/reconciliationService'
import Button from '@/components/atoms/Button'
import Input from '@/components/atoms/Input'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'
import StatusBadge from '@/components/atoms/StatusBadge'

const Reconciliation = () => {
  const [inventory, setInventory] = useState([])
  const [vaccines, setVaccines] = useState([])
  const [physicalCounts, setPhysicalCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  
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
      
      // Initialize physical counts with current system quantities
      const initialCounts = {}
      inventoryData.forEach(item => {
        initialCounts[item.Id] = item.quantityOnHand
      })
      setPhysicalCounts(initialCounts)
      
    } catch (err) {
      setError(err.message || 'Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [])
  
  const handlePhysicalCountChange = (inventoryId, value) => {
    const numValue = parseInt(value) || 0
    
    if (numValue < 0) {
      toast.error('Physical count cannot be negative')
      return
    }
    
    setPhysicalCounts(prev => ({
      ...prev,
      [inventoryId]: numValue
    }))
  }
  
  const getAdjustment = (inventoryId) => {
    const item = inventory.find(i => i.Id === inventoryId)
    const physicalCount = physicalCounts[inventoryId] || 0
    return physicalCount - item.quantityOnHand
  }
  
  const getTotalAdjustments = () => {
    return inventory.reduce((total, item) => {
      const adjustment = getAdjustment(item.Id)
      return total + Math.abs(adjustment)
    }, 0)
  }
  
  const getDiscrepancies = () => {
    return inventory.filter(item => {
      const adjustment = getAdjustment(item.Id)
      return adjustment !== 0
    })
  }
  
  const handleSaveReconciliation = async () => {
    try {
      setSaving(true)
      
      const discrepancies = getDiscrepancies()
      
      if (discrepancies.length === 0) {
        toast.info('No discrepancies found - all quantities match!')
        return
      }
      
      // Create reconciliation records for items with discrepancies
      for (const item of discrepancies) {
        const adjustment = getAdjustment(item.Id)
        
        await reconciliationService.create({
          inventoryId: item.inventoryId,
          systemQuantity: item.quantityOnHand,
          physicalQuantity: physicalCounts[item.Id],
          adjustmentQuantity: adjustment,
          reconciliationDate: new Date().toISOString().split('T')[0],
          performedBy: 'Healthcare Admin'
        })
        
        // Update inventory quantities
        await inventoryService.update(item.Id, {
          quantityOnHand: physicalCounts[item.Id]
        })
      }
      
      toast.success(`Reconciliation completed! ${discrepancies.length} item(s) adjusted.`)
      
      // Reload data
      loadData()
      
    } catch (error) {
      toast.error('Failed to complete reconciliation: ' + error.message)
    } finally {
      setSaving(false)
    }
  }
  
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
  
  if (loading) return <Loading type="table" />
  if (error) return <Error message={error} onRetry={loadData} />
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Reconciliation</h1>
          <p className="text-gray-600 mt-2">Compare system quantities with physical inventory counts</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Adjustments</p>
            <p className="text-2xl font-bold text-accent">{getTotalAdjustments()}</p>
          </div>
          <Button
            variant="primary"
            onClick={handleSaveReconciliation}
            loading={saving}
            disabled={saving}
            icon="CheckSquare"
          >
            Complete Reconciliation
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
            </div>
            <div className="bg-primary bg-opacity-20 p-3 rounded-full">
              <span className="text-primary text-xl">📦</span>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Discrepancies</p>
              <p className="text-2xl font-bold text-warning">{getDiscrepancies().length}</p>
            </div>
            <div className="bg-warning bg-opacity-20 p-3 rounded-full">
              <span className="text-warning text-xl">⚠️</span>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Reconciliation Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="bg-success bg-opacity-20 p-3 rounded-full">
              <span className="text-success text-xl">📅</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reconciliation Table */}
      <div className="card">
        {inventory.length === 0 ? (
          <Empty
            icon="CheckSquare"
            title="No Inventory to Reconcile"
            description="No inventory items are available for reconciliation."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vaccine Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    System Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Physical Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adjustment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item, index) => {
                  const vaccine = vaccines.find(v => v.vaccineId === item.vaccineId)
                  const statusInfo = getStatusInfo(item)
                  const adjustment = getAdjustment(item.Id)
                  
                  return (
                    <motion.tr
                      key={item.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-gray-50 transition-colors duration-150 ${
                        adjustment !== 0 ? 'bg-yellow-50' : ''
                      }`}
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={statusInfo.status}>
                          {statusInfo.text}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.quantityOnHand}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="number"
                          min="0"
                          value={physicalCounts[item.Id] || ''}
                          onChange={(e) => handlePhysicalCountChange(item.Id, e.target.value)}
                          className="w-20"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          adjustment > 0 ? 'text-green-600' : 
                          adjustment < 0 ? 'text-red-600' : 
                          'text-gray-500'
                        }`}>
                          {adjustment > 0 ? '+' : ''}{adjustment}
                        </div>
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

export default Reconciliation