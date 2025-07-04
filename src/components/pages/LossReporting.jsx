import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import inventoryService from '@/services/api/inventoryService'
import vaccineService from '@/services/api/vaccineService'
import vaccineLossService from '@/services/api/vaccineLossService'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'

const LossReporting = () => {
  const [inventory, setInventory] = useState([])
  const [vaccines, setVaccines] = useState([])
  const [lossReasons, setLossReasons] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    inventoryId: '',
    lossQuantity: '',
    lossReason: '',
    lossDetails: '',
    trainingCompleted: false
  })
  const [errors, setErrors] = useState({})
  
  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [inventoryData, vaccineData, reasonsData] = await Promise.all([
        inventoryService.getAll(),
        vaccineService.getAll(),
        vaccineLossService.getLossReasons()
      ])
      
      setInventory(inventoryData)
      setVaccines(vaccineData)
      setLossReasons(reasonsData)
      
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadData()
  }, [])
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }
  
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.inventoryId) newErrors.inventoryId = 'Please select an inventory lot'
    if (!formData.lossQuantity) newErrors.lossQuantity = 'Loss quantity is required'
    if (!formData.lossReason) newErrors.lossReason = 'Loss reason is required'
    if (!formData.lossDetails) newErrors.lossDetails = 'Loss details are required'
    if (!formData.trainingCompleted) newErrors.trainingCompleted = 'Training confirmation is required'
    
    // Validate loss quantity doesn't exceed available quantity
    if (formData.inventoryId && formData.lossQuantity) {
const selectedItem = inventory.find(item => item.Id === parseInt(formData.inventoryId))
      if (selectedItem && parseInt(formData.lossQuantity) > selectedItem.quantity_on_hand) {
        newErrors.lossQuantity = `Cannot exceed available quantity (${selectedItem.quantity_on_hand})`
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting')
      return
    }
    
    try {
      setSaving(true)
      
      const selectedItem = inventory.find(item => item.Id === parseInt(formData.inventoryId))
      
      // Create loss record
await vaccineLossService.create({
        Name: `LOSS-${Date.now()}`,
        loss_id: `LOSS-${Date.now()}`,
        inventory_id: selectedItem.inventory_id,
        loss_quantity: parseInt(formData.lossQuantity),
loss_reason: formData.lossReason,
        loss_details: formData.lossDetails,
        training_completed: formData.trainingCompleted,
        report_date: new Date().toISOString().split('T')[0]
      })
      
// Update inventory quantity
      const newQuantity = selectedItem.quantity_on_hand - parseInt(formData.lossQuantity)
      await inventoryService.update(selectedItem.Id, {
        quantity_on_hand: newQuantity
      })
      
      toast.success('Vaccine loss reported successfully!')
      
      // Reset form
      setFormData({
        inventoryId: '',
        lossQuantity: '',
        lossReason: '',
        lossDetails: '',
        trainingCompleted: false
      })
      
      // Reload data
      loadData()
      
    } catch (error) {
      toast.error('Failed to report vaccine loss: ' + error.message)
    } finally {
      setSaving(false)
    }
  }
  
  const getInventoryOptions = () => {
return inventory.map(item => {
      const vaccine = vaccines.find(v => v.vaccine_id === item.vaccine_id)
      return {
        value: item.Id.toString(),
        label: `${vaccine?.commercial_name || 'Unknown'} - Lot: ${item.lot_number} (${item.quantity_on_hand} available)`
      }
    })
  }
  
  const getSelectedItemQuantity = () => {
    if (!formData.inventoryId) return 0
const selectedItem = inventory.find(item => item.Id === parseInt(formData.inventoryId))
    return selectedItem ? selectedItem.quantity_on_hand : 0
  }
  
  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={loadData} />
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vaccine Loss Reporting</h1>
        <p className="text-gray-600 mt-2">Report vaccine wastage or loss with mandatory training confirmation</p>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Inventory Lot"
              type="select"
              name="inventoryId"
              value={formData.inventoryId}
              onChange={handleInputChange}
              options={getInventoryOptions()}
              placeholder="Select inventory lot"
              required
              error={errors.inventoryId}
            />
            
            <FormField
              label="Loss Quantity"
              type="number"
              name="lossQuantity"
              value={formData.lossQuantity}
              onChange={handleInputChange}
              placeholder="Enter quantity lost"
              required
              error={errors.lossQuantity}
            />
          </div>
          
          {formData.inventoryId && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Available Quantity:</strong> {getSelectedItemQuantity()} doses
              </p>
            </div>
          )}
          
          <FormField
            label="Loss Reason"
            type="select"
            name="lossReason"
            value={formData.lossReason}
            onChange={handleInputChange}
            options={lossReasons}
            placeholder="Select loss reason"
            required
            error={errors.lossReason}
          />
          
          <FormField
            label="Loss Details"
            type="text"
            name="lossDetails"
            value={formData.lossDetails}
            onChange={handleInputChange}
            placeholder="Provide detailed explanation of the loss"
            required
            error={errors.lossDetails}
          />
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Confirmation</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="trainingCompleted"
                  name="trainingCompleted"
                  checked={formData.trainingCompleted}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="trainingCompleted" className="text-sm text-gray-700">
                  I confirm that I have completed the required training for vaccine loss prevention and reporting procedures.
                  <span className="text-red-500 ml-1">*</span>
                </label>
              </div>
              {errors.trainingCompleted && (
                <p className="text-sm text-red-600">{errors.trainingCompleted}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                inventoryId: '',
                lossQuantity: '',
                lossReason: '',
                lossDetails: '',
                trainingCompleted: false
              })}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              variant="error"
              loading={saving}
              disabled={saving}
              icon="AlertTriangle"
            >
              Report Loss
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default LossReporting