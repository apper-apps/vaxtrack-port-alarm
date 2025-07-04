import React, { useContext, useState } from "react";
import { useSelector } from "react-redux";
import { AuthContext } from "@/App";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
const Header = ({ onMenuToggle, title = 'Dashboard' }) => {
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Update time every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
            icon="Menu"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        
<div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <ApperIcon name="Clock" size={16} />
            <span>
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          
          <UserSection />
          
          <Button
            variant="outline"
            size="sm"
            icon="Bell"
            className="relative"
          >
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
</div>
    </header>
  )
}
const UserSection = () => {
  const { user } = useSelector((state) => state.user)
  const { logout } = useContext(AuthContext)
  
  if (!user) return null
  
  return (
    <div className="flex items-center space-x-3">
      <div className="hidden md:flex flex-col text-right">
        <span className="text-sm font-medium text-gray-900">
          {user.firstName} {user.lastName}
        </span>
        <span className="text-xs text-gray-500">
          {user.emailAddress}
        </span>
      </div>
      <div className="bg-primary bg-opacity-20 p-2 rounded-full">
        <ApperIcon name="User" size={16} className="text-primary" />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={logout}
        icon="LogOut"
        className="text-gray-600 hover:text-gray-900"
      >
        <span className="hidden md:inline">Logout</span>
      </Button>
    </div>
  )
}

export default Header