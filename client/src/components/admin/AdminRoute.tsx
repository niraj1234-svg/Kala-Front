import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'
import '../../styles/Admin.css'

interface AdminRouteProps {
  children?: React.ReactNode
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAdminAuthenticated, isAdminLoading, adminUser } = useAdmin()
  const location = useLocation()

  // 1. Initial hydration and authoritative backend token check in progress
  if (isAdminLoading) {
    return (
      <div className="admin-loading-screen" role="status" aria-live="polite">
        <div className="admin-spinner" />
        <span>Verifying administrative authorization...</span>
      </div>
    )
  }

  // 2. Unauthenticated or non-admin user -> redirect to /admin/login
  if (!isAdminAuthenticated || !adminUser || adminUser.role !== 'admin') {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // 3. Authenticated administrator -> render protected layout/page
  return <>{children}</>
}

export default AdminRoute
