import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useState } from 'react'

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }
  
  return (
    <div className="flex h-screen bg-secondary">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <main className={`flex-1 flex flex-col overflow-hidden transition-all ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
