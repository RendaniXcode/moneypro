import { Navigate, Route, Routes } from 'react-router-dom'
import Login from '../pages/Login'
import Register from '../pages/Register'
import DashboardLayout from '../layouts/DashboardLayout'
import Dashboard from '../pages/Dashboard'
import Analytics from '../pages/Analytics'
import Reports from '../pages/Reports'
import UploadFinancialStatement from '../pages/UploadFinancialStatement'
import Settings from '../pages/Settings'
import NotFound from '../pages/NotFound'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../context/AuthContext'

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
      />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute element={<DashboardLayout />} />}>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="upload-financial-statement" element={<UploadFinancialStatement />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Redirect root to dashboard or login */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
      />
      
      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
