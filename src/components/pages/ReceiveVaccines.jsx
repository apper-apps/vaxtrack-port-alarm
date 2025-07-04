import { useState } from 'react'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import FormField from '@/components/molecules/FormField'
import Button from '@/components/atoms/Button'
import vaccineService from '@/services/api/vaccineService'
import inventoryService from '@/services/api/inventoryService'

const ReceiveVaccines = () => {
  const [formData, setFormData] = useState({
    vaccineId: '',
    commercialName: '',
    genericName: '',
    vaccineFamily: '',
    lotNumber: '',
    expirationDate: '',
    quantityReceived: '',
    passingInspection: '',
    failedInspection: '',
    discrepancyReason: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  const vaccineOptions = [
    { value: 'VAX-001', label: 'Pfizer-BioNTech COVID-19' },
    { value: 'VAX-002', label: 'Moderna COVID-19' },
    { value: 'VAX-003', label: 'Fluzone Quadrivalent' },
    { value: 'VAX-004', label: 'Prevnar 13' },
    { value: 'VAX-005', label: 'Tdap Adacel' },
    { value: 'VAX-006', label: 'Shingrix' },
    { value: 'VAX-007', label: 'Hepatitis B Adult' },
    { value: 'VAX-008', label: 'MMR II' }
  ]
  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    
    if (!formData.vaccineId) newErrors.vaccineId = 'Vaccine selection is required'
    if (!formData.lotNumber) newErrors.lotNumber = 'Lot number is required'
    if (!formData.expirationDate) newErrors.expirationDate = 'Expiration date is required'
    if (!formData.quantityReceived) newErrors.quantityReceived = 'Quantity received is required'
    if (!formData.passingInspection) newErrors.passingInspection = 'Passing inspection count is required'
    if (!formData.failedInspection) newErrors.failedInspection = 'Failed inspection count is required'
    
    const quantityReceived = parseInt(formData.quantityReceived) || 0
    const passingInspection = parseInt(formData.passingInspection) || 0
    const failedInspection = parseInt(formData.failedInspection) || 0
    
    if (passingInspection + failedInspection !== quantityReceived) {
      newErrors.passingInspection = 'Passing + Failed inspection must equal quantity received'
      newErrors.failedInspection = 'Passing + Failed inspection must equal quantity received'
    }
    
    if (failedInspection > 0 && !formData.discrepancyReason) {
      newErrors.discrepancyReason = 'Discrepancy reason is required when there are failed inspections'
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
      setLoading(true)
      
const inventoryData = {
        Name: `INV-${Date.now()}`,
        inventory_id: `INV-${Date.now()}`,
        vaccine_id: formData.vaccineId,
        lot_number: formData.lotNumber,
        expiration_date: formData.expirationDate,
        received_date: new Date().toISOString().split('T')[0],
        quantity_received: parseInt(formData.quantityReceived),
        quantity_on_hand: parseInt(formData.passingInspection), // Only passing inspection goes to inventory
        passing_inspection: parseInt(formData.passingInspection),
        failed_inspection: parseInt(formData.failedInspection),
        discrepancy_reason: formData.discrepancyReason,
        status: 'Good'
      }
      
      await inventoryService.create(inventoryData)
      toast.success('Vaccine shipment received successfully!')
      
      // Reset form
      setFormData({
        vaccineId: '',
        commercialName: '',
        genericName: '',
        vaccineFamily: '',
        lotNumber: '',
        expirationDate: '',
        quantityReceived: '',
        passingInspection: '',
        failedInspection: '',
        discrepancyReason: ''
      })
      
    } catch (error) {
      toast.error('Failed to receive vaccine shipment: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Receive Vaccines</h1>
        <p className="text-gray-600 mt-2">Record new vaccine shipments and quality inspections</p>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Vaccine"
              type="select"
              name="vaccineId"
              value={formData.vaccineId}
              onChange={handleInputChange}
              options={vaccineOptions}
              placeholder="Select vaccine"
              required
              error={errors.vaccineId}
            />
            
            <FormField
              label="Lot Number"
              type="text"
              name="lotNumber"
              value={formData.lotNumber}
              onChange={handleInputChange}
              placeholder="Enter lot number"
              required
              error={errors.lotNumber}
            />
            
            <FormField
              label="Expiration Date"
              type="date"
              name="expirationDate"
              value={formData.expirationDate}
              onChange={handleInputChange}
              required
              error={errors.expirationDate}
            />
            
            <FormField
              label="Quantity Received"
              type="number"
              name="quantityReceived"
              value={formData.quantityReceived}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              required
              error={errors.quantityReceived}
            />
          </div>
          
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Inspection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Doses Passing Inspection"
                type="number"
                name="passingInspection"
                value={formData.passingInspection}
                onChange={handleInputChange}
                placeholder="Enter passing count"
                required
                error={errors.passingInspection}
              />
              
              <FormField
                label="Doses Failed Inspection"
                type="number"
                name="failedInspection"
                value={formData.failedInspection}
                onChange={handleInputChange}
                placeholder="Enter failed count"
                required
                error={errors.failedInspection}
              />
            </div>
            
            {parseInt(formData.failedInspection) > 0 && (
              <FormField
                label="Discrepancy Reason"
                type="text"
                name="discrepancyReason"
                value={formData.discrepancyReason}
                onChange={handleInputChange}
                placeholder="Explain reason for failed inspection"
                required
                error={errors.discrepancyReason}
              />
            )}
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                vaccineId: '',
                commercialName: '',
                genericName: '',
                vaccineFamily: '',
                lotNumber: '',
                expirationDate: '',
                quantityReceived: '',
                passingInspection: '',
                failedInspection: '',
                discrepancyReason: ''
              })}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Receive Vaccines
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ReceiveVaccines