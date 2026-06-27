import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminLogin, isAdminAuthenticated, verifyAdminLogin } from '../../lib/adminAuth';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 400));

    const result = await verifyAdminLogin(credentials.username, credentials.password);
    if (result.ok) {
      adminLogin();
      navigate('/admin', { replace: true });
    } else {
      setError(result.error ?? 'Invalid username or password.');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">⚙️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h2>
          <p className="text-gray-900">Sign in to manage site content, villas, and bookings.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-base font-semibold text-pink-600 mb-1">Username</label>
            <input
              type="text"
              required
              autoComplete="username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="admin"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-base font-semibold text-pink-600 mb-1">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter password"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <Link to="/" className="block text-gray-900 hover:text-gray-700 text-base font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
