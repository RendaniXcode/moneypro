import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from '../context/AuthContext'
import ProtectedRoute from './ProtectedRoute'

// Layout is used on most routes, so no need to lazy load
import DashboardLayout from '../layouts/DashboardLayout'

// Eagerly load small, frequently accessed components
import NotFound from '../pages/NotFound'

// Lazy load all other pages to reduce initial bundle size
const Login = lazy(() => import('../pages/Login'))
const Register = lazy(() => import('../pages/Register'))
const Dashboard = lazy(() => import('../pages/Dashboard'))
const Analytics = lazy(() => import('../pages/Analytics'))
const RunAnalysis = lazy(() => import('../pages/Reports')) // Using existing file with renamed export
const UploadFinancialStatement = lazy(() => import('../pages/UploadFinancialStatement'))
const Settings = lazy(() => import('../pages/Settings'))

// Loading component for suspense fallback
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600">Loading...</p>
        </div>
    </div>
)

const AppRoutes = () => {
    const { isAuthenticated, isLoading } = useAuth()

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route
                path="/login"
                element={
                    isAuthenticated ? (
                        <Navigate to="/dashboard" />
                    ) : (
                        <Suspense fallback={<LoadingSpinner />}>
                            <Login />
                        </Suspense>
                    )
                }
            />
            <Route
                path="/register"
                element={
                    isAuthenticated ? (
                        <Navigate to="/dashboard" />
                    ) : (
                        <Suspense fallback={<LoadingSpinner />}>
                            <Register />
                        </Suspense>
                    )
                }
            />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute element={<DashboardLayout />} />}>
                <Route
                    index
                    element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <Dashboard />
                        </Suspense>
                    }
                />
                <Route
                    path="analytics"
                    element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <Analytics />
                        </Suspense>
                    }
                />
                <Route
                    path="reports"
                    element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <RunAnalysis />
                        </Suspense>
                    }
                />
                <Route
                    path="upload-financial-statement"
                    element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <UploadFinancialStatement />
                        </Suspense>
                    }
                />
                <Route
                    path="settings"
                    element={
                        <Suspense fallback={<LoadingSpinner />}>
                            <Settings />
                        </Suspense>
                    }
                />
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