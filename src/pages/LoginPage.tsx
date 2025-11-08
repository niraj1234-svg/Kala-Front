import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authStore, useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const authState = useAuthStore((state) => state);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    setFormError('');
    try {
      await authStore.login({ email, password });
      navigate('/');
    } catch (error) {
      // authStore already sets error state
      console.error('Login failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex justify-center items-center px-4 pt-20">
      <div className="w-full max-w-md">
        
        
        <div className="bg-white p-8 rounded-md shadow-sm">
          <h2 className="text-2xl font-medium text-center mb-6">Login</h2>
          
          <div className="mb-4 text-center text-gray-600">
            Don't have an account yet? <Link to="/signup" className="text-black font-medium">Create account</Link>
          </div>

          {(formError || authState.error) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {formError || authState.error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div className="mb-6 text-sm">
              <button type="button" className="text-gray-600 hover:text-black">
                Forgot your password?
              </button>
            </div>
            
            <button
              type="submit"
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition duration-200 disabled:opacity-60"
              disabled={authState.loading}
            >
              {authState.loading ? 'Signing In...' : 'SIGN IN'}
            </button>
          </form>
          
          <div className="mt-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-black">
              Return to Store
            </Link>
          </div>
        </div>
        
        
      </div>
    </div>
  );
};

export default LoginPage;
