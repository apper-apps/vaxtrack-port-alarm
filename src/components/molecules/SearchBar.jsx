import { useState } from 'react'
import Input from '@/components/atoms/Input'
import ApperIcon from '@/components/ApperIcon'

const SearchBar = ({ onSearch, placeholder = 'Search...', className = '', value = '', onClear }) => {
  const [searchTerm, setSearchTerm] = useState(value)
  
  const handleSearch = (e) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    onSearch(newValue)
  }
  
  const handleClear = () => {
    setSearchTerm('')
    onSearch('')
    if (onClear) onClear()
  }
  
  // Sync with external value changes
  useState(() => {
    setSearchTerm(value)
  }, [value])
  
return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ApperIcon name="Search" size={20} className="text-gray-400" />
      </div>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
        className="pl-10 pr-10"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <ApperIcon name="X" size={16} />
        </button>
      )}
    </div>
  )
}

export default SearchBar