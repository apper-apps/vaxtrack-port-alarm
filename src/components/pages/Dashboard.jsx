import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useDashboardMetrics } from '@/hooks/useVaccineData'
import MetricCard from '@/components/molecules/MetricCard'
import Button from '@/components/atoms/Button'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import AlertBanner from '@/components/molecules/AlertBanner'

const Dashboard = () => {
  const navigate = useNavigate()
  const { metrics, loading, error, refetch } = useDashboardMetrics()
  
  if (loading) return <Loading type="cards" />
  if (error) return <Error message={error} onRetry={refetch} />
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Vaccine inventory overview and quick actions</p>
        </div>
      </div>
      
      {/* Alert Banners */}
      <div className="space-y-4">
        {metrics.expired > 0 && (
          <AlertBanner
            type="error"
            message={`${metrics.expired} vaccine lot${metrics.expired > 1 ? 's' : ''} have expired and need immediate attention`}
          />
        )}
        {metrics.expiringSoon > 0 && (
          <AlertBanner
            type="warning"
            message={`${metrics.expiringSoon} vaccine lot${metrics.expiringSoon > 1 ? 's' : ''} will expire within 30 days`}
          />
        )}
        {metrics.lowStock > 0 && (
          <AlertBanner
            type="warning"
            message={`${metrics.lowStock} vaccine${metrics.lowStock > 1 ? 's' : ''} are running low on stock`}
          />
        )}
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Doses"
          value={metrics.totalDoses.toLocaleString()}
          icon="Package"
          gradient="from-primary to-blue-600"
        />
        <MetricCard
          title="Administered Doses"
          value={metrics.administeredDoses.toLocaleString()}
          icon="Syringe"
          gradient="from-success to-emerald-600"
        />
        <MetricCard
          title="Expiring Soon"
          value={metrics.expiringSoon}
          icon="Clock"
          gradient="from-warning to-orange-600"
        />
        <MetricCard
          title="Expired"
          value={metrics.expired}
          icon="AlertTriangle"
          gradient="from-error to-red-600"
        />
      </div>
      
      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="primary"
              size="lg"
              icon="Package"
              onClick={() => navigate('/receive-vaccines')}
              className="w-full h-16 text-left justify-start"
            >
              <div>
                <div className="font-semibold">Receive Vaccines</div>
                <div className="text-sm opacity-90">Record new vaccine shipments</div>
              </div>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="secondary"
              size="lg"
              icon="Syringe"
              onClick={() => navigate('/record-administration')}
              className="w-full h-16 text-left justify-start"
            >
              <div>
                <div className="font-semibold">Record Administration</div>
                <div className="text-sm opacity-90">Update administered doses</div>
              </div>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="accent"
              size="lg"
              icon="CheckSquare"
              onClick={() => navigate('/reconciliation')}
              className="w-full h-16 text-left justify-start"
            >
              <div>
                <div className="font-semibold">Monthly Reconciliation</div>
                <div className="text-sm opacity-90">Verify physical inventory</div>
              </div>
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Inventory Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Low Stock Items</h2>
          {metrics.lowStock > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-700">Items requiring attention</span>
                <span className="text-lg font-bold text-warning">{metrics.lowStock}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/inventory')}
                className="w-full"
              >
                View Inventory Details
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-green-600 mb-2">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-gray-600">All vaccines have adequate stock levels</p>
            </div>
          )}
        </div>
        
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 py-2">
              <div className="bg-success bg-opacity-20 p-2 rounded-full">
                <span className="text-success text-sm">✓</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Vaccine shipment received</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 py-2">
              <div className="bg-primary bg-opacity-20 p-2 rounded-full">
                <span className="text-primary text-sm">💉</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Doses administered</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 py-2">
              <div className="bg-warning bg-opacity-20 p-2 rounded-full">
                <span className="text-warning text-sm">⚠</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Expiration alert triggered</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard