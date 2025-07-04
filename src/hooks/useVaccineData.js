import { useState, useEffect } from 'react'
import vaccineService from '@/services/api/vaccineService'
import inventoryService from '@/services/api/inventoryService'
import administrationService from '@/services/api/administrationService'

export const useVaccineData = () => {
  const [vaccines, setVaccines] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [vaccineData, inventoryData] = await Promise.all([
        vaccineService.getAll(),
        inventoryService.getAll()
      ])
      
      setVaccines(vaccineData)
      setInventory(inventoryData)
    } catch (err) {
      setError(err.message || 'Failed to load vaccine data')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [])
  
  return {
    vaccines,
    inventory,
    loading,
    error,
    refetch: loadData
  }
}

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState({
    totalDoses: 0,
    administeredDoses: 0,
    expiringSoon: 0,
    expired: 0,
    lowStock: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const loadMetrics = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [
        inventory,
        totalAdministered,
        expiring,
        expired,
        lowStock
      ] = await Promise.all([
        inventoryService.getAll(),
        administrationService.getTotalAdministered(),
        inventoryService.getExpiringVaccines(30),
        inventoryService.getExpiredVaccines(),
        inventoryService.getLowStockVaccines(20)
      ])
      
const totalDoses = inventory.reduce((sum, item) => sum + item.quantity_on_hand, 0)
      
      setMetrics({
        totalDoses,
        administeredDoses: totalAdministered,
        expiringSoon: expiring.length,
        expired: expired.length,
        lowStock: lowStock.length
      })
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadMetrics()
  }, [])
  
  return {
    metrics,
    loading,
    error,
    refetch: loadMetrics
  }
}