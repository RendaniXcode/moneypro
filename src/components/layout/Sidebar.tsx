import { NavLink } from 'react-router-dom'
import { 
  FaHome, 
  FaChartBar, 
  FaCreditCard, 
  FaChartLine, 
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa'

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ collapsed, toggleSidebar }: SidebarProps) => {
  return (
    <aside 
      className={`fixed h-full bg-primary transition-all duration-300 z-10 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
        {!collapsed && (
          <div className="text-white font-bold text-lg">MoneyMind Pro</div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="text-white font-bold text-xl">M</div>
          </div>
        )}
        <button 
          onClick={toggleSidebar} 
          className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
        >
          {collapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>
      </div>
      
      <nav className="mt-6">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <FaHome size={18} />
          {!collapsed && <span>Home</span>}
        </NavLink>
        
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <FaChartBar size={18} />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
        
        <NavLink 
          to="/credit-reports" 
          className={({ isActive }) => 
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <FaCreditCard size={18} />
          {!collapsed && <span>Credit Reports</span>}
        </NavLink>
        
        <NavLink 
          to="/analytics" 
          className={({ isActive }) => 
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <FaChartLine size={18} />
          {!collapsed && <span>Analytics</span>}
        </NavLink>
        
        <NavLink 
          to="/reports" 
          className={({ isActive }) => 
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <FaFileAlt size={18} />
          {!collapsed && <span>Reports</span>}
        </NavLink>
      </nav>
      
      <div className="absolute bottom-4 left-0 right-0 px-4 text-white/50 text-xs">
        {!collapsed && <div>Version 1.0.0</div>}
      </div>
    </aside>
  )
}

export default Sidebar
