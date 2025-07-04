import ApperIcon from '@/components/ApperIcon'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 transform hover:scale-[0.98] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg hover:from-blue-700 hover:to-blue-800',
    secondary: 'bg-gradient-to-r from-secondary to-cyan-600 text-white shadow-lg hover:from-cyan-700 hover:to-cyan-800',
    accent: 'bg-gradient-to-r from-accent to-amber-600 text-white shadow-lg hover:from-amber-600 hover:to-amber-700',
    success: 'bg-gradient-to-r from-success to-emerald-600 text-white shadow-lg hover:from-emerald-600 hover:to-emerald-700',
    error: 'bg-gradient-to-r from-error to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700',
    outline: 'border-2 border-primary text-primary bg-white hover:bg-primary hover:text-white',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  }
  
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      {...props}
    >
      {loading && <ApperIcon name="Loader2" size={iconSizes[size]} className="animate-spin mr-2" />}
      {!loading && icon && iconPosition === 'left' && (
        <ApperIcon name={icon} size={iconSizes[size]} className="mr-2" />
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <ApperIcon name={icon} size={iconSizes[size]} className="ml-2" />
      )}
    </button>
  )
}

export default Button