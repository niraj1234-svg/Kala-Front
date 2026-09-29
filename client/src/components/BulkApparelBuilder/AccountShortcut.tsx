import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import AccountModal from './AccountModal'

export const AccountShortcut: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const userFirst = currentUser?.firstName || ''
  const initial = userFirst ? userFirst[0].toUpperCase() : (currentUser?.email ? currentUser.email[0].toUpperCase() : '')
  const fullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || currentUser?.email || ''

  return (
    <>
      <div className="kala-bulk-account-shortcut">
        <button
          type="button"
          className="kala-bulk-account-btn"
          onClick={() => setIsModalOpen(true)}
          title={isAuthenticated ? `Logged in as ${fullName}` : 'Login or Create Account'}
          aria-label="Account options"
        >
          {/* Tooltip / Label matching Reference 2 */}
          <div className="kala-bulk-account-pill">
            <span>{isAuthenticated ? `Hi, ${userFirst || 'Member'}` : 'Login or Create Account'}</span>
          </div>

          {/* Circular Person Icon */}
          <div className="kala-bulk-account-avatar">
            {isAuthenticated && initial ? (
              <span className="kala-bulk-avatar-initial">{initial}</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
        </button>
      </div>

      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default AccountShortcut
