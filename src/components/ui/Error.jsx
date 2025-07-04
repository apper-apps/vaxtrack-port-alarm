import { motion } from 'framer-motion'
import Button from '@/components/atoms/Button'
import ApperIcon from '@/components/ApperIcon'

const Error = ({ message = 'Something went wrong', onRetry }) => {
  // Enhanced error message handling for network issues
  const getErrorMessage = () => {
    if (message.includes('Network Error') || message.includes('SDK not loaded')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.'
    }
    if (message.includes('failed to fetch') || message.includes('Failed to fetch')) {
      return 'Connection failed. Please verify your network connection and try again.'
    }
    return message
  }

  const getErrorTitle = () => {
    if (message.includes('Network Error') || message.includes('SDK not loaded') || message.includes('failed to fetch')) {
      return 'Connection Error'
    }
    return 'Error Loading Data'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <ApperIcon name="AlertCircle" size={32} className="text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{getErrorTitle()}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{getErrorMessage()}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary" icon="RefreshCw">
          Try Again
        </Button>
      )}
    </motion.div>
  )
}

export default Error