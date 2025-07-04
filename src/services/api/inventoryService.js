import inventoryData from '@/services/mockData/inventory.json'

class InventoryService {
  constructor() {
    this.inventory = [...inventoryData]
  }
  
  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.inventory])
      }, 300)
    })
  }
  
  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = this.inventory.find(i => i.Id === parseInt(id))
        if (item) {
          resolve({ ...item })
        } else {
          reject(new Error('Inventory item not found'))
        }
      }, 200)
    })
  }
  
  async create(inventoryData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem = {
          ...inventoryData,
          Id: Math.max(...this.inventory.map(i => i.Id)) + 1
        }
        this.inventory.push(newItem)
        resolve({ ...newItem })
      }, 400)
    })
  }
  
  async update(id, inventoryData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.inventory.findIndex(i => i.Id === parseInt(id))
        if (index !== -1) {
          this.inventory[index] = { ...this.inventory[index], ...inventoryData }
          resolve({ ...this.inventory[index] })
        } else {
          reject(new Error('Inventory item not found'))
        }
      }, 300)
    })
  }
  
  async delete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.inventory.findIndex(i => i.Id === parseInt(id))
        if (index !== -1) {
          const deletedItem = this.inventory.splice(index, 1)[0]
          resolve({ ...deletedItem })
        } else {
          reject(new Error('Inventory item not found'))
        }
      }, 300)
    })
  }
  
  async getExpiringVaccines(days = 30) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const today = new Date()
        const cutoffDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
        
        const expiring = this.inventory.filter(item => {
          const expirationDate = new Date(item.expirationDate)
          return expirationDate <= cutoffDate && expirationDate > today
        })
        
        resolve([...expiring])
      }, 200)
    })
  }
  
  async getExpiredVaccines() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const today = new Date()
        
        const expired = this.inventory.filter(item => {
          const expirationDate = new Date(item.expirationDate)
          return expirationDate <= today
        })
        
        resolve([...expired])
      }, 200)
    })
  }
  
  async getLowStockVaccines(threshold = 20) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lowStock = this.inventory.filter(item => 
          item.quantityOnHand <= threshold && item.quantityOnHand > 0
        )
        
        resolve([...lowStock])
      }, 200)
    })
  }
}

export default new InventoryService()