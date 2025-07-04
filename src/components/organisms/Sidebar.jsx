import { NavLink } from 'react-router-dom'
import ApperIcon from '@/components/ApperIcon'

const Sidebar = ({ isOpen = true, onClose }) => {
  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: 'BarChart3' },
    { path: '/receive-vaccines', label: 'Receive Vaccines', icon: 'Package' },
    { path: '/inventory', label: 'Inventory', icon: 'Warehouse' },
    { path: '/record-administration', label: 'Record Administration', icon: 'Syringe' },
    { path: '/reconciliation', label: 'Reconciliation', icon: 'CheckSquare' },
    { path: '/loss-reporting', label: 'Loss Reporting', icon: 'AlertTriangle' },
    { path: '/reports', label: 'Reports', icon: 'FileText' }
  ]
  
  return (
<>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 bg-white border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg">
                <ApperIcon name="Shield" size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">VaxTrack Pro</span>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <ApperIcon name={item.icon} size={20} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          
<div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="bg-gray-200 p-2 rounded-full">
                <ApperIcon name="User" size={20} />
              </div>
              <div>
                <p className="font-medium">Healthcare Admin</p>
                <p className="text-sm text-gray-500">System User</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
<div className="relative flex flex-col w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out border-r border-gray-200">
            <div className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-primary to-blue-600 p-2 rounded-lg">
                  <ApperIcon name="Shield" size={20} className="text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">VaxTrack Pro</span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900"
              >
                <ApperIcon name="X" size={24} />
              </button>
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <ApperIcon name={item.icon} size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            
<div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="bg-gray-200 p-2 rounded-full">
                  <ApperIcon name="User" size={20} />
                </div>
                <div>
                  <p className="font-medium">Healthcare Admin</p>
                  <p className="text-sm text-gray-500">System User</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar