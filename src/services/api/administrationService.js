import { toast } from 'react-toastify'

class AdministrationService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'administration'
  }
  
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "administration_id" } },
          { field: { Name: "administered_doses" } },
          { field: { Name: "administration_date" } },
          { field: { Name: "administered_by" } },
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
      console.error('Error fetching administrations:', error)
      toast.error('Failed to fetch administrations')
      return []
    }
  }
  
  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "administration_id" } },
          { field: { Name: "administered_doses" } },
          { field: { Name: "administration_date" } },
          { field: { Name: "administered_by" } },
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
      console.error(`Error fetching administration with ID ${id}:`, error)
      toast.error('Failed to fetch administration record')
      return null
    }
  }
  
  async create(administrationData) {
    try {
      const params = {
        records: [{
          Name: administrationData.Name || administrationData.administration_id,
          administration_id: administrationData.administration_id,
          administered_doses: administrationData.administered_doses,
          administration_date: administrationData.administration_date,
          administered_by: administrationData.administered_by,
          inventory_id: administrationData.inventory_id
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
      console.error('Error creating administration:', error)
      toast.error('Failed to create administration record')
      return null
    }
  }
  
  async update(id, administrationData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: administrationData.Name || administrationData.administration_id,
          administration_id: administrationData.administration_id,
          administered_doses: administrationData.administered_doses,
          administration_date: administrationData.administration_date,
          administered_by: administrationData.administered_by,
          inventory_id: administrationData.inventory_id
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
      console.error('Error updating administration:', error)
      toast.error('Failed to update administration record')
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
      console.error('Error deleting administration:', error)
      toast.error('Failed to delete administration record')
      return false
    }
  }
  
  async getTotalAdministered() {
    try {
      const params = {
        fields: [
          { field: { Name: "administered_doses" }, Function: "Sum" }
        ]
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      
      if (!response.success) {
        console.error(response.message)
        return 0
      }
      
      if (response.data && response.data.length > 0) {
        return response.data[0].administered_doses || 0
      }
      
      return 0
    } catch (error) {
      console.error('Error fetching total administered:', error)
      return 0
    }
  }
}

export default new AdministrationService()