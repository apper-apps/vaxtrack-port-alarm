const StatusBadge = ({ status, children, className = '' }) => {
  const statusClasses = {
    expiring: 'status-badge status-expiring',
    expired: 'status-badge status-expired',
    'low-stock': 'status-badge status-low-stock',
    good: 'status-badge status-good'
  }
  
  const classes = `${statusClasses[status] || 'status-badge'} ${className}`
  
  return (
    <span className={classes}>
      {children}
    </span>
  )
}

export default StatusBadge