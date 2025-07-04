import { toast } from 'react-toastify'

class VaccineLossService {
constructor() {
    this.tableName = 'vaccine_loss'
    this.apperClient = null
  }

  getClient() {
    if (!this.apperClient) {
      if (!window.ApperSDK) {
        throw new Error('Apper SDK not loaded. Please check your network connection and try again.')
      }
      const { ApperClient } = window.ApperSDK
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      })
    }
    return this.apperClient
  }
  
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "loss_id" } },
          { field: { Name: "loss_quantity" } },
          { field: { Name: "loss_reason" } },
          { field: { Name: "loss_details" } },
          { field: { Name: "training_completed" } },
          { field: { Name: "report_date" } },
          { 
            field: { Name: "inventory_id" },
            referenceField: { field: { Name: "Name" } }
          }
        ]
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error('Error fetching vaccine losses:', error)
      toast.error('Failed to fetch vaccine losses')
      return []
    }
  }
  
  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "loss_id" } },
          { field: { Name: "loss_quantity" } },
          { field: { Name: "loss_reason" } },
          { field: { Name: "loss_details" } },
          { field: { Name: "training_completed" } },
          { field: { Name: "report_date" } },
          { 
            field: { Name: "inventory_id" },
            referenceField: { field: { Name: "Name" } }
          }
        ]
      }
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      return response.data
    } catch (error) {
      console.error(`Error fetching vaccine loss with ID ${id}:`, error)
      toast.error('Failed to fetch vaccine loss record')
      return null
    }
  }
  
  async create(lossData) {
    try {
      const params = {
        records: [{
          Name: lossData.Name || lossData.loss_id,
          loss_id: lossData.loss_id,
          loss_quantity: lossData.loss_quantity,
          loss_reason: lossData.loss_reason,
          loss_details: lossData.loss_details,
          training_completed: lossData.training_completed,
          report_date: lossData.report_date,
          inventory_id: lossData.inventory_id
        }]
      }
      
      const response = await this.apperClient.createRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success)
        const failedRecords = response.results.filter(result => !result.success)
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`)
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null
      }
      
      return null
    } catch (error) {
      console.error('Error creating vaccine loss:', error)
      toast.error('Failed to create vaccine loss record')
      return null
    }
  }
  
  async update(id, lossData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: lossData.Name || lossData.loss_id,
          loss_id: lossData.loss_id,
          loss_quantity: lossData.loss_quantity,
          loss_reason: lossData.loss_reason,
          loss_details: lossData.loss_details,
          training_completed: lossData.training_completed,
          report_date: lossData.report_date,
          inventory_id: lossData.inventory_id
        }]
      }
      
      const response = await this.apperClient.updateRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return null
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success)
        const failedUpdates = response.results.filter(result => !result.success)
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`)
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              toast.error(`${error.fieldLabel}: ${error.message}`)
            })
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null
      }
      
      return null
    } catch (error) {
      console.error('Error updating vaccine loss:', error)
      toast.error('Failed to update vaccine loss record')
      return null
    }
  }
  
  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      }
      
      const response = await this.apperClient.deleteRecord(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        toast.error(response.message)
        return false
      }
      
      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success)
        const failedDeletions = response.results.filter(result => !result.success)
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} records:${JSON.stringify(failedDeletions)}`)
          
          failedDeletions.forEach(record => {
            if (record.message) toast.error(record.message)
          })
        }
        
        return successfulDeletions.length > 0
      }
      
      return false
    } catch (error) {
      console.error('Error deleting vaccine loss:', error)
      toast.error('Failed to delete vaccine loss record')
      return false
    }
  }
  
  async getLossReasons() {
    // Return static loss reasons as these are predefined options
    return new Promise((resolve) => {
      setTimeout(() => {
        const reasons = [
          { value: 'expired', label: 'Expired' },
          { value: 'temperature-excursion', label: 'Temperature Excursion' },
          { value: 'broken-vial', label: 'Broken Vial' },
          { value: 'contamination', label: 'Contamination' },
          { value: 'power-outage', label: 'Power Outage' },
          { value: 'equipment-failure', label: 'Equipment Failure' },
          { value: 'human-error', label: 'Human Error' },
          { value: 'other', label: 'Other' }
        ]
        resolve(reasons)
      }, 100)
    })
  }
}

export default new VaccineLossService()