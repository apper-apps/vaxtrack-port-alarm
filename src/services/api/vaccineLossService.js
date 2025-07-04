import vaccineLossData from '@/services/mockData/vaccineLoss.json'

class VaccineLossService {
  constructor() {
    this.losses = [...vaccineLossData]
  }
  
  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.losses])
      }, 300)
    })
  }
  
  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const loss = this.losses.find(l => l.Id === parseInt(id))
        if (loss) {
          resolve({ ...loss })
        } else {
          reject(new Error('Vaccine loss record not found'))
        }
      }, 200)
    })
  }
  
  async create(lossData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newLoss = {
          ...lossData,
          Id: Math.max(...this.losses.map(l => l.Id)) + 1
        }
        this.losses.push(newLoss)
        resolve({ ...newLoss })
      }, 400)
    })
  }
  
  async update(id, lossData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.losses.findIndex(l => l.Id === parseInt(id))
        if (index !== -1) {
          this.losses[index] = { ...this.losses[index], ...lossData }
          resolve({ ...this.losses[index] })
        } else {
          reject(new Error('Vaccine loss record not found'))
        }
      }, 300)
    })
  }
  
  async delete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.losses.findIndex(l => l.Id === parseInt(id))
        if (index !== -1) {
          const deletedLoss = this.losses.splice(index, 1)[0]
          resolve({ ...deletedLoss })
        } else {
          reject(new Error('Vaccine loss record not found'))
        }
      }, 300)
    })
  }
  
  async getLossReasons() {
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