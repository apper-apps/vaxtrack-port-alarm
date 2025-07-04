import Input from '@/components/atoms/Input'
import Select from '@/components/atoms/Select'

const FormField = ({ 
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = '',
  disabled = false,
  error = '',
  required = false,
  className = ''
}) => {
  const InputComponent = type === 'select' ? Select : Input
  
  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <InputComponent
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        error={!!error}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default FormField