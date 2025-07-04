import { useState } from 'react'
import { toast } from 'react-toastify'
import vaccineService from '@/services/api/vaccineService'
import inventoryService from '@/services/api/inventoryService'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

// Vaccine inventory data from user query
const vaccineInventoryData = [
  { commercialName: "Daptacel SDV", genericName: "DTaP", lotNumber: "3CA03C3", expirationDate: "9/30/25", quantityOnHand: 1 },
  { commercialName: "Quadracel PFS", genericName: "DTaP-IPV", lotNumber: "U7908AA", expirationDate: "10/3/25", quantityOnHand: 18 },
  { commercialName: "IPOL MDV", genericName: "IPV", lotNumber: "W1C741M", expirationDate: "11/11/25", quantityOnHand: 5 },
  { commercialName: "Engerix-B PFS", genericName: "Hep B", lotNumber: "X024135", expirationDate: "5/21/26", quantityOnHand: 1 },
  { commercialName: "Engerix-B PFS", genericName: "Hep B", lotNumber: "X021477", expirationDate: "5/18/26", quantityOnHand: 10 },
  { commercialName: "Beyfortus 100mg PFS", genericName: "RSV", lotNumber: "", expirationDate: "", quantityOnHand: 0 },
  { commercialName: "Beyfortus 50mg PFS", genericName: "RSV", lotNumber: "", expirationDate: "", quantityOnHand: 0 },
  { commercialName: "MMR II SDV", genericName: "MMR", lotNumber: "Y014095", expirationDate: "9/19/26", quantityOnHand: 1 },
  { commercialName: "MMR II SDV", genericName: "MMR", lotNumber: "Y015020", expirationDate: "9/5/26", quantityOnHand: 20 },
  { commercialName: "ActHib SDV", genericName: "Hib", lotNumber: "UK148AA", expirationDate: "9/30/25", quantityOnHand: 7 },
  { commercialName: "Adacel PFS", genericName: "Tdap", lotNumber: "4CA04C1", expirationDate: "10/20/26", quantityOnHand: 16 },
  { commercialName: "Varivax SDV", genericName: "Varicella", lotNumber: "Y017914", expirationDate: "10/28/28", quantityOnHand: 2 },
  { commercialName: "Varivax SDV", genericName: "Varicella", lotNumber: "Z004454", expirationDate: "2/13/27", quantityOnHand: 10 },
  { commercialName: "MenQuadFi SDV", genericName: "MCV4", lotNumber: "U8494AA", expirationDate: "6/20/28", quantityOnHand: 18 },
  { commercialName: "Bexsero PFS", genericName: "MenB", lotNumber: "CD44A", expirationDate: "3/31/28", quantityOnHand: 4 },
  { commercialName: "Vaqta PFS", genericName: "Hep A", lotNumber: "Y014585", expirationDate: "2/1/26", quantityOnHand: 2 },
  { commercialName: "Vaqta PFS", genericName: "Hep A", lotNumber: "Y015910", expirationDate: "2/6/26", quantityOnHand: 20 },
  { commercialName: "Pentacel SDV", genericName: "DTaP-IPV-Hib", lotNumber: "UK329AA", expirationDate: "7/20/26", quantityOnHand: 6 },
  { commercialName: "Gardasil PFS", genericName: "HPV", lotNumber: "Y013768", expirationDate: "2/12/27", quantityOnHand: 11 },
  { commercialName: "Proquad SDV", genericName: "MMRV", lotNumber: "Y019176", expirationDate: "5/18/26", quantityOnHand: 1 },
  { commercialName: "Proquad SDV", genericName: "MMRV", lotNumber: "Z007581", expirationDate: "10/12/26", quantityOnHand: 20 },
  { commercialName: "Rotateq Oral Applicator", genericName: "RV (Rotavirus)", lotNumber: "Y018378", expirationDate: "5/10/26", quantityOnHand: 25 },
  { commercialName: "Rotateq Oral Applicator", genericName: "RV (Rotavirus)", lotNumber: "Y014321", expirationDate: "5/1/26", quantityOnHand: 6 },
  { commercialName: "Vaxelis PFS", genericName: "DTaP-IPV-Hib-Hep B", lotNumber: "U7788AA", expirationDate: "6/8/26", quantityOnHand: 18 },
  { commercialName: "Vaxelis PFS", genericName: "DTaP-IPV-Hib-Hep B", lotNumber: "U7767AA", expirationDate: "5/26/26", quantityOnHand: 10 },
  { commercialName: "Vaxneuvance (PCV15) PFS", genericName: "PCV15", lotNumber: "Y019380", expirationDate: "5/28/27", quantityOnHand: 13 }
]

const BulkVaccineInserter = ({ onComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [results, setResults] = useState({ success: 0, failed: 0, errors: [] })

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    // Convert MM/DD/YY to YYYY-MM-DD
    const [month, day, year] = dateStr.split('/')
    const fullYear = year.length === 2 ? `20${year}` : year
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const generateInventoryId = (index, commercialName) => {
    const prefix = commercialName.split(' ')[0].toUpperCase().substring(0, 3)
    return `INV-${prefix}-${(index + 1).toString().padStart(3, '0')}`
  }

  const generateVaccineId = (index, commercialName) => {
    const prefix = commercialName.split(' ')[0].toUpperCase().substring(0, 3)
    return `VAX-${prefix}-${(index + 1).toString().padStart(3, '0')}`
  }

  const findOrCreateVaccine = async (item, index) => {
    try {
      // First, try to find existing vaccine by commercial name
      const existingVaccines = await vaccineService.getAll()
      const existingVaccine = existingVaccines.find(v => 
        v.commercial_name?.toLowerCase() === item.commercialName.toLowerCase()
      )

      if (existingVaccine) {
        return existingVaccine.Id
      }

      // Create new vaccine record
      const vaccineData = {
        Name: item.commercialName,
        vaccine_id: generateVaccineId(index, item.commercialName),
        commercial_name: item.commercialName,
        generic_name: item.genericName,
        vaccine_family: item.genericName,
        manufacturer_id: 'MFR-TBD'
      }

      const newVaccine = await vaccineService.create(vaccineData)
      return newVaccine?.Id || null
    } catch (error) {
      console.error('Error finding/creating vaccine:', error)
      return null
    }
  }

  const createInventoryRecord = async (item, index, vaccineId) => {
    try {
      const inventoryData = {
        Name: `${item.commercialName} - ${item.lotNumber || 'No Lot'}`,
        inventory_id: generateInventoryId(index, item.commercialName),
        lot_number: item.lotNumber || '',
        expiration_date: formatDate(item.expirationDate),
        received_date: new Date().toISOString().split('T')[0], // Today's date
        quantity_received: item.quantityOnHand || 0,
        quantity_on_hand: item.quantityOnHand || 0,
        passing_inspection: item.quantityOnHand || 0,
        failed_inspection: 0,
        discrepancy_reason: '',
        status: item.quantityOnHand === 0 ? 'Out of Stock' : 'Good',
        vaccine_id: vaccineId
      }

      const result = await inventoryService.create(inventoryData)
      return result !== null
    } catch (error) {
      console.error('Error creating inventory record:', error)
      return false
    }
  }

  const processBulkInsert = async () => {
    setIsProcessing(true)
    setProgress({ current: 0, total: vaccineInventoryData.length })
    const newResults = { success: 0, failed: 0, errors: [] }

    try {
      for (let i = 0; i < vaccineInventoryData.length; i++) {
        const item = vaccineInventoryData[i]
        setProgress({ current: i + 1, total: vaccineInventoryData.length })

        try {
          // Find or create vaccine
          const vaccineId = await findOrCreateVaccine(item, i)
          
          if (!vaccineId) {
            newResults.failed++
            newResults.errors.push(`Failed to create/find vaccine for ${item.commercialName}`)
            continue
          }

          // Create inventory record
          const inventorySuccess = await createInventoryRecord(item, i, vaccineId)
          
          if (inventorySuccess) {
            newResults.success++
          } else {
            newResults.failed++
            newResults.errors.push(`Failed to create inventory for ${item.commercialName}`)
          }
        } catch (error) {
          newResults.failed++
          newResults.errors.push(`Error processing ${item.commercialName}: ${error.message}`)
        }
      }

      setResults(newResults)

      // Show summary notifications
      if (newResults.success > 0) {
        toast.success(`Successfully added ${newResults.success} vaccine inventory records`)
      }
      
      if (newResults.failed > 0) {
        toast.error(`Failed to add ${newResults.failed} records. Check console for details.`)
        console.error('Failed records:', newResults.errors)
      }

      if (onComplete) {
        onComplete(newResults)
      }

    } catch (error) {
      console.error('Bulk insert error:', error)
      toast.error('Failed to process bulk vaccine insertion')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="card p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Vaccine Inventory Insertion</h2>
        <p className="text-gray-600">
          This will add {vaccineInventoryData.length} vaccine inventory records to the database.
        </p>
      </div>

      {/* Progress Indicator */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Processing vaccines...
            </span>
            <span className="text-sm text-gray-500">
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Results Summary */}
      {results.success > 0 || results.failed > 0 ? (
        <div className="mb-6 space-y-2">
          {results.success > 0 && (
            <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded-lg">
              <ApperIcon name="CheckCircle" size={20} />
              <span>Successfully added {results.success} records</span>
            </div>
          )}
          {results.failed > 0 && (
            <div className="flex items-center space-x-2 text-red-700 bg-red-50 p-3 rounded-lg">
              <ApperIcon name="XCircle" size={20} />
              <span>Failed to add {results.failed} records</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={processBulkInsert}
          disabled={isProcessing}
          variant="primary"
          icon={isProcessing ? "Loader" : "Plus"}
          className="px-8 py-3"
        >
          {isProcessing ? 'Processing...' : 'Add Vaccine Inventory'}
        </Button>
      </div>

      {/* Preview Data */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview of Records to Add:</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Commercial Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Generic Name</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Lot Number</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expiration</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vaccineInventoryData.slice(0, 10).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-900">{item.commercialName}</td>
                  <td className="px-3 py-2 text-gray-700">{item.genericName}</td>
                  <td className="px-3 py-2 text-gray-700">{item.lotNumber || 'N/A'}</td>
                  <td className="px-3 py-2 text-gray-700">{item.expirationDate || 'N/A'}</td>
                  <td className="px-3 py-2 text-gray-700">{item.quantityOnHand}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {vaccineInventoryData.length > 10 && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              ... and {vaccineInventoryData.length - 10} more records
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default BulkVaccineInserter