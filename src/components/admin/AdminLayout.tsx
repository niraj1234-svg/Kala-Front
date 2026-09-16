import React from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext'
import '../../styles/Admin.css'

interface AdminLayoutProps {
  children?: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminUser, adminLogout } = useAdmin()
  const navigate = useNavigate()

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login', { replace: true })
  }

  const navItems = [
    { label: 'Dashboard', to: '/admin', available: true, end: true },
    { label: 'Orders', to: '/admin/orders', available: true, end: false },
    { label: 'Products', to: '/admin/products', available: true, end: false },
    { label: 'Custom Apparel', to: '/admin/custom-requests', available: true, end: false },
    { label: 'Business Branding', to: '/admin/business-requests', available: true, end: false },
    { label: 'Customers', to: '/admin/customers', available: true, end: false },
    { label: 'Analytics', to: '/admin/analytics', available: false, end: false },
  ]

  return (
    <div className="admin-layout-container">
      {/* 1. SIDEBAR */}
      <aside className="admin-sidebar" aria-label="Admin navigation">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-brand">
            <span className="admin-sidebar-logo">KALA</span>
            <span className="admin-sidebar-tag">Control Panel</span>
          </div>
        </div>

        <nav className="admin-nav-list">
          {navItems.map((item) => (
            item.available ? (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `admin-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <span>{item.label}</span>
              </NavLink>
            ) : (
              <div
                key={item.label}
                className="admin-nav-item disabled"
                title="Available in future phase"
                aria-disabled="true"
              >
                <span>{item.label}</span>
                <span className="admin-badge-placeholder">Coming soon</span>
              </div>
            )
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-logout-btn"
            onClick={handleLogout}
            aria-label="Sign out of admin session"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div className="admin-topbar-title">Overview</div>

          <div className="admin-topbar-user">
            <div className="admin-user-avatar" aria-hidden="true">
              {adminUser?.firstName ? adminUser.firstName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">
                {adminUser ? `${adminUser.firstName} ${adminUser.lastName}` : 'Administrator'}
              </span>
              <span className="admin-user-role">System Admin</span>
            </div>
          </div>
        </header>

        <main className="admin-content-outlet">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
