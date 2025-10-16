import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface LoginPageProps {
  onLogin: (name: string, email: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // In a real app, you would call an API here
    // For this example, we'll just simulate a successful login
    const userName = email.split('@')[0]; // Extract name from email
    onLogin(userName, email);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex justify-center items-center px-4 pt-20">
      <div className="w-full max-w-md">
        
        
        <div className="bg-white p-8 rounded-md shadow-sm">
          <h2 className="text-2xl font-medium text-center mb-6">Login</h2>
          
          <div className="mb-4 text-center text-gray-600">
            Don't have an account yet? <Link to="/signup" className="text-black font-medium">Create account</Link>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
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
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition duration-200"
            >
              SIGN IN
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
