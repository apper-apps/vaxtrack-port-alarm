import { toast } from 'react-toastify'

class ReconciliationService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'reconciliation'
  }
  
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "reconciliation_id" } },
          { field: { Name: "system_quantity" } },
          { field: { Name: "physical_quantity" } },
          { field: { Name: "adjustment_quantity" } },
          { field: { Name: "reconciliation_date" } },
          { field: { Name: "performed_by" } },
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
      console.error('Error fetching reconciliations:', error)
      toast.error('Failed to fetch reconciliations')
      return []
    }
  }
  
  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "reconciliation_id" } },
          { field: { Name: "system_quantity" } },
          { field: { Name: "physical_quantity" } },
          { field: { Name: "adjustment_quantity" } },
          { field: { Name: "reconciliation_date" } },
          { field: { Name: "performed_by" } },
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
      console.error(`Error fetching reconciliation with ID ${id}:`, error)
      toast.error('Failed to fetch reconciliation record')
      return null
    }
  }
  
  async create(reconciliationData) {
    try {
      const params = {
        records: [{
          Name: reconciliationData.Name || reconciliationData.reconciliation_id,
          reconciliation_id: reconciliationData.reconciliation_id,
          system_quantity: reconciliationData.system_quantity,
          physical_quantity: reconciliationData.physical_quantity,
          adjustment_quantity: reconciliationData.adjustment_quantity,
          reconciliation_date: reconciliationData.reconciliation_date,
          performed_by: reconciliationData.performed_by,
          inventory_id: reconciliationData.inventory_id
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
      console.error('Error creating reconciliation:', error)
      toast.error('Failed to create reconciliation record')
      return null
    }
  }
  
  async update(id, reconciliationData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: reconciliationData.Name || reconciliationData.reconciliation_id,
          reconciliation_id: reconciliationData.reconciliation_id,
          system_quantity: reconciliationData.system_quantity,
          physical_quantity: reconciliationData.physical_quantity,
          adjustment_quantity: reconciliationData.adjustment_quantity,
          reconciliation_date: reconciliationData.reconciliation_date,
          performed_by: reconciliationData.performed_by,
          inventory_id: reconciliationData.inventory_id
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
      console.error('Error updating reconciliation:', error)
      toast.error('Failed to update reconciliation record')
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
      console.error('Error deleting reconciliation:', error)
      toast.error('Failed to delete reconciliation record')
      return false
    }
  }
}

export default new ReconciliationService()