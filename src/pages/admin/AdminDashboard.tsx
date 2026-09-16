import React from 'react'
import { useAdmin } from '../../context/AdminContext'
import '../../styles/Admin.css'

export const AdminDashboard: React.FC = () => {
  const { adminUser } = useAdmin()

  const adminName = adminUser?.firstName || 'Admin'

  const modules = [
    {
      title: 'Orders Management',
      status: 'Coming Soon',
      description: 'Review orders, update fulfillment statuses, and manage tracking numbers.',
    },
    {
      title: 'Product Catalog',
      status: 'Coming Soon',
      description: 'Create, edit, and deactivate luxury apparel items and inventory.',
    },
    {
      title: 'Customer Inquiries',
      status: 'Coming Soon',
      description: 'Manage custom apparel design submissions and corporate quote workflows.',
    },
    {
      title: 'Customer Directory',
      status: 'Coming Soon',
      description: 'View registered customer profiles, contact info, and purchase histories.',
    },
  ]

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <h1 className="admin-dashboard-heading">KALA Admin Dashboard</h1>
        <p className="admin-dashboard-subheading">
          Welcome back, {adminName}. System authentication verified and administrative session active.
        </p>
      </header>

      <div className="admin-cards-grid">
        {modules.map((mod) => (
          <div key={mod.title} className="admin-card">
            <div className="admin-card-header">
              <span className="admin-card-title">{mod.title}</span>
              <span className="admin-card-status">{mod.status}</span>
            </div>
            <div className="admin-card-body">
              <p>{mod.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard
