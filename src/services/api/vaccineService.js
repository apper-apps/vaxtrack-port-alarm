import { toast } from 'react-toastify'

class VaccineService {
  constructor() {
    const { ApperClient } = window.ApperSDK
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    })
    this.tableName = 'vaccine'
  }
  
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "vaccine_id" } },
          { field: { Name: "commercial_name" } },
          { field: { Name: "generic_name" } },
          { field: { Name: "vaccine_family" } },
          { field: { Name: "manufacturer_id" } }
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
      console.error('Error fetching vaccines:', error)
      toast.error('Failed to fetch vaccines')
      return []
    }
  }
  
  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "vaccine_id" } },
          { field: { Name: "commercial_name" } },
          { field: { Name: "generic_name" } },
          { field: { Name: "vaccine_family" } },
          { field: { Name: "manufacturer_id" } }
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
      console.error(`Error fetching vaccine with ID ${id}:`, error)
      toast.error('Failed to fetch vaccine')
      return null
    }
  }
  
  async create(vaccineData) {
    try {
      const params = {
        records: [{
          Name: vaccineData.Name || vaccineData.commercial_name,
          vaccine_id: vaccineData.vaccine_id,
          commercial_name: vaccineData.commercial_name,
          generic_name: vaccineData.generic_name,
          vaccine_family: vaccineData.vaccine_family,
          manufacturer_id: vaccineData.manufacturer_id
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
      console.error('Error creating vaccine:', error)
      toast.error('Failed to create vaccine')
      return null
    }
  }
  
  async update(id, vaccineData) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: vaccineData.Name || vaccineData.commercial_name,
          vaccine_id: vaccineData.vaccine_id,
          commercial_name: vaccineData.commercial_name,
          generic_name: vaccineData.generic_name,
          vaccine_family: vaccineData.vaccine_family,
          manufacturer_id: vaccineData.manufacturer_id
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
      console.error('Error updating vaccine:', error)
      toast.error('Failed to update vaccine')
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
      console.error('Error deleting vaccine:', error)
      toast.error('Failed to delete vaccine')
      return false
    }
  }
}

export default new VaccineService()