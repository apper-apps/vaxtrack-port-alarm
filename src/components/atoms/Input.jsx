import { forwardRef } from 'react'

const Input = forwardRef(({ 
  type = 'text',
  placeholder = '',
  value,
  onChange,
  onBlur,
  disabled = false,
  error = false,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'input-field'
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : ''
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : ''
  
  const classes = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`
  
  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={classes}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export default Input