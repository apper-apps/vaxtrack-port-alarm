import administrationData from '@/services/mockData/administration.json'

class AdministrationService {
  constructor() {
    this.administrations = [...administrationData]
  }
  
  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.administrations])
      }, 300)
    })
  }
  
  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const admin = this.administrations.find(a => a.Id === parseInt(id))
        if (admin) {
          resolve({ ...admin })
        } else {
          reject(new Error('Administration record not found'))
        }
      }, 200)
    })
  }
  
  async create(administrationData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newAdmin = {
          ...administrationData,
          Id: Math.max(...this.administrations.map(a => a.Id)) + 1
        }
        this.administrations.push(newAdmin)
        resolve({ ...newAdmin })
      }, 400)
    })
  }
  
  async update(id, administrationData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.administrations.findIndex(a => a.Id === parseInt(id))
        if (index !== -1) {
          this.administrations[index] = { ...this.administrations[index], ...administrationData }
          resolve({ ...this.administrations[index] })
        } else {
          reject(new Error('Administration record not found'))
        }
      }, 300)
    })
  }
  
  async delete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.administrations.findIndex(a => a.Id === parseInt(id))
        if (index !== -1) {
          const deletedAdmin = this.administrations.splice(index, 1)[0]
          resolve({ ...deletedAdmin })
        } else {
          reject(new Error('Administration record not found'))
        }
      }, 300)
    })
  }
  
  async getTotalAdministered() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const total = this.administrations.reduce((sum, admin) => sum + admin.administeredDoses, 0)
        resolve(total)
      }, 200)
    })
  }
}

export default new AdministrationService()