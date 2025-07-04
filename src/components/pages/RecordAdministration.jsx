import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import StatusBadge from "@/components/atoms/StatusBadge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import vaccineService from "@/services/api/vaccineService";
import inventoryService from "@/services/api/inventoryService";
import administrationService from "@/services/api/administrationService";

const RecordAdministration = () => {
  const [inventory, setInventory] = useState([])
  const [vaccines, setVaccines] = useState([])
  const [administrationData, setAdministrationData] = useState({})
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
      
      // Only show inventory with quantities > 0
const availableInventory = inventoryData.filter(item => item.quantity_on_hand > 0)
      setInventory(availableInventory)
      setVaccines(vaccineData)
      
      // Initialize administration data
      const initialData = {}
      availableInventory.forEach(item => {
        initialData[item.Id] = 0
      })
      setAdministrationData(initialData)
      
    } catch (err) {
      setError(err.message || 'Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [])
  
  const handleAdministrationChange = (inventoryId, value) => {
    const numValue = parseInt(value) || 0
    const item = inventory.find(i => i.Id === inventoryId)
    
if (numValue > item.quantity_on_hand) {
      toast.error(`Cannot administer more than ${item.quantity_on_hand} doses available`)
      return
    }
    
    setAdministrationData(prev => ({
      ...prev,
      [inventoryId]: numValue
    }))
  }
  
  const handleSaveAdministration = async () => {
    try {
      setSaving(true)
      
      const administrationEntries = Object.entries(administrationData)
        .filter(([_, doses]) => doses > 0)
.map(([inventoryId, doses]) => ({
          Name: `ADM-${Date.now()}-${inventoryId}`,
          administration_id: `ADM-${Date.now()}-${inventoryId}`,
          inventory_id: inventoryId,
administered_doses: doses,
          administration_date: new Date().toISOString().split('T')[0],
          administered_by: 'Healthcare Admin'
        }))
      
      if (administrationEntries.length === 0) {
        toast.warning('No doses to record')
        return
      }
      
      // Create administration records
      for (const entry of administrationEntries) {
        await administrationService.create(entry)
      }
      
      // Update inventory quantities
      for (const [inventoryId, doses] of Object.entries(administrationData)) {
if (doses > 0) {
          const item = inventory.find(i => i.Id === parseInt(inventoryId))
          const newQuantity = item.quantity_on_hand - doses
await inventoryService.update(parseInt(inventoryId), {
            quantity_on_hand: newQuantity
          })
        }
      }
      
      toast.success('Administration recorded successfully!')
      
      // Reset form and reload data
      setAdministrationData({})
      loadData()
      
    } catch (error) {
      toast.error('Failed to record administration: ' + error.message)
    } finally {
      setSaving(false)
    }
  }
  
  const getTotalDoses = () => {
    return Object.values(administrationData).reduce((sum, doses) => sum + doses, 0)
  }
const getStatusInfo = (item) => {
    const expirationDate = new Date(item.expiration_date)
    const today = new Date()
    const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiration <= 0) {
      return { status: 'expired', text: 'Expired' }
    } else if (daysUntilExpiration <= 30) {
      return { status: 'expiring', text: `Expires in ${daysUntilExpiration} days` }
} else if (item.quantity_on_hand <= 20) {
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
          <h1 className="text-3xl font-bold text-gray-900">Record Administration</h1>
          <p className="text-gray-600 mt-2">Update administered doses for available vaccines</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Doses to Record</p>
            <p className="text-2xl font-bold text-primary">{getTotalDoses()}</p>
          </div>
          <Button
            variant="primary"
            onClick={handleSaveAdministration}
            loading={saving}
            disabled={saving || getTotalDoses() === 0}
            icon="Save"
          >
            Save Administration
          </Button>
        </div>
      </div>
      
      {/* Administration Table */}
      <div className="card">
        {inventory.length === 0 ? (
          <Empty
            icon="Syringe"
            title="No Available Vaccines"
            description="No vaccines are currently available for administration."
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
                    Generic Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity On Hand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administered Doses
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventory.map((item, index) => {
const vaccine = vaccines.find(v => v.vaccine_id === item.vaccine_id)
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
<div className="text-sm font-medium text-gray-900">
                          {vaccine?.commercial_name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
<div className="text-sm text-gray-900">
                          {vaccine?.generic_name || 'Unknown'}
                        </div>
                      </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.lot_number}
                      </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.expiration_date).toLocaleDateString()}
                      </td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity_on_hand}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={statusInfo.status}>
                          {statusInfo.text}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="number"
min="0"
                          max={item.quantity_on_hand}
                          value={administrationData[item.Id] || ''}
                          onChange={(e) => handleAdministrationChange(item.Id, e.target.value)}
                          className="w-20"
                          placeholder="0"
                        />
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

export default RecordAdministration