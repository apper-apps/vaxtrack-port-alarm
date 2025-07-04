import { toast } from 'react-toastify'

class InventoryService {
  constructor() {
    this.tableName = 'inventory'
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
      // Initialize ApperClient
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      this.tableName = 'inventory';
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "inventory_id" } },
          { field: { Name: "lot_number" } },
          { field: { Name: "expiration_date" } },
          { field: { Name: "received_date" } },
          { field: { Name: "quantity_received" } },
          { field: { Name: "quantity_on_hand" } },
          { field: { Name: "passing_inspection" } },
          { field: { Name: "failed_inspection" } },
          { field: { Name: "discrepancy_reason" } },
          { field: { Name: "status" } },
          { 
            field: { Name: "vaccine_id" },
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
      console.error('Error fetching inventory:', error)
      toast.error('Failed to fetch inventory')
      return []
    }
  }
  
  async getById(id) {
try {
      // Initialize ApperClient
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      this.tableName = 'inventory';
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "inventory_id" } },
          { field: { Name: "lot_number" } },
          { field: { Name: "expiration_date" } },
          { field: { Name: "received_date" } },
          { field: { Name: "quantity_received" } },
          { field: { Name: "quantity_on_hand" } },
          { field: { Name: "passing_inspection" } },
          { field: { Name: "failed_inspection" } },
          { field: { Name: "discrepancy_reason" } },
          { field: { Name: "status" } },
          { 
            field: { Name: "vaccine_id" },
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
      console.error(`Error fetching inventory with ID ${id}:`, error)
      toast.error('Failed to fetch inventory item')
      return null
    }
  }
  
  async create(inventoryData) {
try {
      // Initialize ApperClient
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      this.tableName = 'inventory';
      
      const params = {
        records: [{
          Name: inventoryData.Name || inventoryData.inventory_id,
          inventory_id: inventoryData.inventory_id,
          lot_number: inventoryData.lot_number,
          expiration_date: inventoryData.expiration_date,
          received_date: inventoryData.received_date,
          quantity_received: inventoryData.quantity_received,
          quantity_on_hand: inventoryData.quantity_on_hand,
          passing_inspection: inventoryData.passing_inspection,
          failed_inspection: inventoryData.failed_inspection,
          discrepancy_reason: inventoryData.discrepancy_reason,
          status: inventoryData.status,
          vaccine_id: inventoryData.vaccine_id
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
      console.error('Error creating inventory:', error)
      toast.error('Failed to create inventory item')
      return null
    }
  }
  
  async update(id, inventoryData) {
    try {
// Initialize ApperClient
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      this.tableName = 'inventory';
      
      const params = {
        records: [{
          Id: parseInt(id),
          Name: inventoryData.Name || inventoryData.inventory_id,
          inventory_id: inventoryData.inventory_id,
          lot_number: inventoryData.lot_number,
          expiration_date: inventoryData.expiration_date,
          received_date: inventoryData.received_date,
          quantity_received: inventoryData.quantity_received,
          quantity_on_hand: inventoryData.quantity_on_hand,
          passing_inspection: inventoryData.passing_inspection,
          failed_inspection: inventoryData.failed_inspection,
          discrepancy_reason: inventoryData.discrepancy_reason,
          status: inventoryData.status,
          vaccine_id: inventoryData.vaccine_id
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
      console.error('Error updating inventory:', error)
      toast.error('Failed to update inventory item')
      return null
    }
  }
  
  async delete(id) {
    try {
// Initialize ApperClient
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      this.tableName = 'inventory';
      
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
      console.error('Error deleting inventory:', error)
      toast.error('Failed to delete inventory item')
      return false
    }
  }
  
  async getExpiringVaccines(days = 30) {
    try {
// Initialize ApperClient
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      this.tableName = 'inventory';
      
      const today = new Date()
      const cutoffDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "inventory_id" } },
          { field: { Name: "lot_number" } },
          { field: { Name: "expiration_date" } },
          { field: { Name: "quantity_on_hand" } },
          { field: { Name: "status" } },
          { 
            field: { Name: "vaccine_id" },
            referenceField: { field: { Name: "Name" } }
          }
        ],
        where: [
          {
            FieldName: "expiration_date",
            Operator: "LessThanOrEqualTo",
            Values: [cutoffDate.toISOString().split('T')[0]]
          },
          {
            FieldName: "expiration_date",
            Operator: "GreaterThan",
            Values: [today.toISOString().split('T')[0]]
          }
        ]
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      if (!response.success) {
        console.error(response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error('Error fetching expiring vaccines:', error)
      return []
    }
  }
  
  async getExpiredVaccines() {
try {
      // Initialize ApperClient
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      this.tableName = 'inventory';
      
      const today = new Date()
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "inventory_id" } },
          { field: { Name: "lot_number" } },
          { field: { Name: "expiration_date" } },
          { field: { Name: "quantity_on_hand" } },
          { field: { Name: "status" } },
          { 
            field: { Name: "vaccine_id" },
            referenceField: { field: { Name: "Name" } }
          }
        ],
        where: [
          {
            FieldName: "expiration_date",
            Operator: "LessThanOrEqualTo",
            Values: [today.toISOString().split('T')[0]]
          }
        ]
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      if (!response.success) {
        console.error(response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error('Error fetching expired vaccines:', error)
      return []
    }
  }
  
  async getLowStockVaccines(threshold = 20) {
try {
      // Initialize ApperClient
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      this.tableName = 'inventory';
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "inventory_id" } },
          { field: { Name: "lot_number" } },
          { field: { Name: "expiration_date" } },
          { field: { Name: "quantity_on_hand" } },
          { field: { Name: "status" } },
          { 
            field: { Name: "vaccine_id" },
            referenceField: { field: { Name: "Name" } }
          }
        ],
        where: [
          {
            FieldName: "quantity_on_hand",
            Operator: "LessThanOrEqualTo",
            Values: [threshold]
          },
          {
            FieldName: "quantity_on_hand",
            Operator: "GreaterThan",
            Values: [0]
          }
        ]
      }
      
      const response = await this.apperClient.fetchRecords(this.tableName, params)
      if (!response.success) {
        console.error(response.message)
        return []
      }
      
      return response.data || []
    } catch (error) {
      console.error('Error fetching low stock vaccines:', error)
      return []
    }
  }
}

export default new InventoryService()