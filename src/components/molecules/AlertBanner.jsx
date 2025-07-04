import { motion } from 'framer-motion'
import ApperIcon from '@/components/ApperIcon'

const AlertBanner = ({ 
  type = 'info', 
  message, 
  onClose,
  className = ''
}) => {
  const alertStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  }
  
  const iconNames = {
    info: 'Info',
    warning: 'AlertTriangle',
    error: 'AlertCircle',
    success: 'CheckCircle'
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex items-center p-4 rounded-lg border ${alertStyles[type]} ${className}`}
    >
      <ApperIcon name={iconNames[type]} size={20} className="mr-3" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <ApperIcon name="X" size={18} />
        </button>
      )}
    </motion.div>
  )
}

export default AlertBanner