import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../stores/useAdminAuth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, isLoading, error, isAuthenticated } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/admin/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text font-[Poppins]">MaMi's Admin</h1>
          <p className="text-sm text-text-secondary mt-1">Sign in to manage your restaurant</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-[--radius-md] shadow-sm border border-primary/10 p-6 space-y-4">
          {error && (
            <div className="bg-error/10 text-error text-sm px-3 py-2 rounded-[--radius-md]">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="admin@mamis.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-primary/10 rounded-[--radius-md] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-transparent"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-primary text-white rounded-[--radius-md] text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
