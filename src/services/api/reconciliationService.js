import reconciliationData from '@/services/mockData/reconciliation.json'

class ReconciliationService {
  constructor() {
    this.reconciliations = [...reconciliationData]
  }
  
  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.reconciliations])
      }, 300)
    })
  }
  
  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const reconciliation = this.reconciliations.find(r => r.Id === parseInt(id))
        if (reconciliation) {
          resolve({ ...reconciliation })
        } else {
          reject(new Error('Reconciliation record not found'))
        }
      }, 200)
    })
  }
  
  async create(reconciliationData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newReconciliation = {
          ...reconciliationData,
          Id: Math.max(...this.reconciliations.map(r => r.Id)) + 1
        }
        this.reconciliations.push(newReconciliation)
        resolve({ ...newReconciliation })
      }, 400)
    })
  }
  
  async update(id, reconciliationData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.reconciliations.findIndex(r => r.Id === parseInt(id))
        if (index !== -1) {
          this.reconciliations[index] = { ...this.reconciliations[index], ...reconciliationData }
          resolve({ ...this.reconciliations[index] })
        } else {
          reject(new Error('Reconciliation record not found'))
        }
      }, 300)
    })
  }
  
  async delete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.reconciliations.findIndex(r => r.Id === parseInt(id))
        if (index !== -1) {
          const deletedReconciliation = this.reconciliations.splice(index, 1)[0]
          resolve({ ...deletedReconciliation })
        } else {
          reject(new Error('Reconciliation record not found'))
        }
      }, 300)
    })
  }
}

export default new ReconciliationService()