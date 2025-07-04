import vaccinesData from '@/services/mockData/vaccines.json'

class VaccineService {
  constructor() {
    this.vaccines = [...vaccinesData]
  }
  
  async getAll() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.vaccines])
      }, 300)
    })
  }
  
  async getById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const vaccine = this.vaccines.find(v => v.Id === parseInt(id))
        if (vaccine) {
          resolve({ ...vaccine })
        } else {
          reject(new Error('Vaccine not found'))
        }
      }, 200)
    })
  }
  
  async create(vaccineData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newVaccine = {
          ...vaccineData,
          Id: Math.max(...this.vaccines.map(v => v.Id)) + 1
        }
        this.vaccines.push(newVaccine)
        resolve({ ...newVaccine })
      }, 400)
    })
  }
  
  async update(id, vaccineData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.vaccines.findIndex(v => v.Id === parseInt(id))
        if (index !== -1) {
          this.vaccines[index] = { ...this.vaccines[index], ...vaccineData }
          resolve({ ...this.vaccines[index] })
        } else {
          reject(new Error('Vaccine not found'))
        }
      }, 300)
    })
  }
  
  async delete(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.vaccines.findIndex(v => v.Id === parseInt(id))
        if (index !== -1) {
          const deletedVaccine = this.vaccines.splice(index, 1)[0]
          resolve({ ...deletedVaccine })
        } else {
          reject(new Error('Vaccine not found'))
        }
      }, 300)
    })
  }
}

export default new VaccineService()