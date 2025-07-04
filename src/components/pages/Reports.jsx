import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import inventoryService from '@/services/api/inventoryService'
import vaccineService from '@/services/api/vaccineService'
import administrationService from '@/services/api/administrationService'
import vaccineLossService from '@/services/api/vaccineLossService'
import Button from '@/components/atoms/Button'
import FormField from '@/components/molecules/FormField'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'

const Reports = () => {
  const [reportType, setReportType] = useState('inventory')
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const reportTypes = [
    { value: 'inventory', label: 'Current Inventory Report' },
    { value: 'expiring', label: 'Expiring Vaccines Report' },
    { value: 'expired', label: 'Expired Vaccines Report' },
    { value: 'low-stock', label: 'Low Stock Report' },
    { value: 'administration', label: 'Administration Summary' },
    { value: 'loss', label: 'Vaccine Loss Report' }
  ]
  
  const generateReport = async () => {
    try {
      setLoading(true)
      setError('')
      
      let data = null
      
      switch (reportType) {
        case 'inventory': {
          const [inventory, vaccines] = await Promise.all([
            inventoryService.getAll(),
            vaccineService.getAll()
          ])
          data = {
            title: 'Current Inventory Report',
items: inventory.map(item => {
              const vaccine = vaccines.find(v => v.vaccine_id === item.vaccine_id)
              return {
                ...item,
                vaccineName: vaccine?.commercial_name || 'Unknown',
                genericName: vaccine?.generic_name || 'Unknown'
              }
            })
          }
          break
        }
        
        case 'expiring': {
          const [expiring, vaccines] = await Promise.all([
            inventoryService.getExpiringVaccines(30),
            vaccineService.getAll()
          ])
          data = {
            title: 'Expiring Vaccines Report (Next 30 Days)',
items: expiring.map(item => {
              const vaccine = vaccines.find(v => v.vaccine_id === item.vaccine_id)
              return {
                ...item,
                vaccineName: vaccine?.commercial_name || 'Unknown',
                genericName: vaccine?.generic_name || 'Unknown'
              }
            })
          }
          break
        }
        
        case 'expired': {
          const [expired, vaccines] = await Promise.all([
            inventoryService.getExpiredVaccines(),
            vaccineService.getAll()
          ])
          data = {
            title: 'Expired Vaccines Report',
items: expired.map(item => {
              const vaccine = vaccines.find(v => v.vaccine_id === item.vaccine_id)
              return {
                ...item,
                vaccineName: vaccine?.commercial_name || 'Unknown',
                genericName: vaccine?.generic_name || 'Unknown'
              }
            })
          }
          break
        }
        
        case 'low-stock': {
          const [lowStock, vaccines] = await Promise.all([
            inventoryService.getLowStockVaccines(20),
            vaccineService.getAll()
          ])
          data = {
            title: 'Low Stock Report',
items: lowStock.map(item => {
              const vaccine = vaccines.find(v => v.vaccine_id === item.vaccine_id)
              return {
                ...item,
                vaccineName: vaccine?.commercial_name || 'Unknown',
                genericName: vaccine?.generic_name || 'Unknown'
              }
            })
          }
          break
        }
        
        case 'administration': {
          const administrations = await administrationService.getAll()
          data = {
            title: 'Administration Summary Report',
items: administrations,
            totalDoses: administrations.reduce((sum, admin) => sum + admin.administered_doses, 0)
          }
          break
        }
        
        case 'loss': {
          const losses = await vaccineLossService.getAll()
          data = {
            title: 'Vaccine Loss Report',
items: losses,
            totalLoss: losses.reduce((sum, loss) => sum + loss.loss_quantity, 0)
          }
          break
        }
        
        default:
          throw new Error('Invalid report type')
      }
      
      setReportData(data)
      
    } catch (err) {
      setError(err.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }
  
  const exportReport = () => {
    if (!reportData) return
    
    const csvContent = generateCSV(reportData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const generateCSV = (data) => {
    if (!data.items || data.items.length === 0) return ''
    
    const headers = Object.keys(data.items[0])
    const csvHeaders = headers.join(',')
    const csvRows = data.items.map(item => 
      headers.map(header => `"${item[header] || ''}"`).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }
  
  const printReport = () => {
    if (!reportData) return
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportData.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportData.title}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          ${generateHTMLTable(reportData)}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }
  
  const generateHTMLTable = (data) => {
    if (!data.items || data.items.length === 0) return '<p>No data available</p>'
    
    const headers = Object.keys(data.items[0])
    const headerRow = headers.map(header => `<th>${header}</th>`).join('')
    const dataRows = data.items.map(item => 
      `<tr>${headers.map(header => `<td>${item[header] || ''}</td>`).join('')}</tr>`
    ).join('')
    
    return `
      <table>
        <thead>
          <tr>${headerRow}</tr>
        </thead>
        <tbody>
          ${dataRows}
        </tbody>
      </table>
    `
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and export various inventory and administration reports</p>
        </div>
      </div>
      
      {/* Report Configuration */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <FormField
            label="Report Type"
            type="select"
            name="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={reportTypes}
          />
          
          <FormField
            label="Start Date"
            type="date"
            name="startDate"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            disabled={!['administration', 'loss'].includes(reportType)}
          />
          
          <FormField
            label="End Date"
            type="date"
            name="endDate"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            disabled={!['administration', 'loss'].includes(reportType)}
          />
        </div>
        
        <div className="flex justify-end mt-6">
          <Button
            variant="primary"
            onClick={generateReport}
            loading={loading}
            disabled={loading}
            icon="BarChart3"
          >
            Generate Report
          </Button>
        </div>
      </div>
      
      {/* Report Display */}
      {loading && <Loading type="table" />}
      {error && <Error message={error} onRetry={generateReport} />}
      
      {reportData && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{reportData.title}</h3>
              <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={printReport}
                icon="Printer"
              >
                Print
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={exportReport}
                icon="Download"
              >
                Export CSV
              </Button>
            </div>
          </div>
          
          {reportData.items && reportData.items.length > 0 ? (
            <div className="p-6">
              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{reportData.items.length}</p>
                </div>
                
                {reportData.totalDoses && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Doses</p>
                    <p className="text-2xl font-bold text-success">{reportData.totalDoses}</p>
                  </div>
                )}
                
                {reportData.totalLoss && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Total Loss</p>
                    <p className="text-2xl font-bold text-error">{reportData.totalLoss}</p>
                  </div>
                )}
              </div>
              
              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(reportData.items[0]).map(key => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.items.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {Object.values(item).map((value, i) => (
                          <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <Empty
              icon="FileText"
              title="No Data Available"
              description="No data found for the selected report criteria."
            />
          )}
        </motion.div>
      )}
    </div>
  )
}

export default Reports