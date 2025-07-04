import { forwardRef } from 'react'

const Select = forwardRef(({ 
  options = [],
  value,
  onChange,
  onBlur,
  disabled = false,
  error = false,
  placeholder = 'Select an option',
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'input-field'
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : ''
  const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : ''
  
  const classes = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`
  
  return (
    <select
      ref={ref}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={classes}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
})

Select.displayName = 'Select'

export default Select