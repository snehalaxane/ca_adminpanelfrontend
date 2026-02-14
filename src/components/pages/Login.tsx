import React, { useState } from 'react';
import { Lock, Mail, Loader } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface LoginProps {
  onLoginSuccess?: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log("📤 Sending login request to:", `${API_BASE_URL}/api/admin/login`);
      console.log("API_BASE_URL value:", API_BASE_URL);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      console.log("📥 Response status:", response.status);
      
      const data = await response.json();
      console.log("📥 Full response data:", data);
      console.log("📥 Token in response?", Boolean(data.token), "Value:", data.token?.substring(0, 20));

      if (!response.ok) {
        console.error("❌ Login failed with status:", response.status);
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      if (!data.token) {
        console.error("❌ No token in response! Response was:", JSON.stringify(data));
        setError('No token received from server');
        setLoading(false);
        return;
      }

      // Store token in localStorage
      try {
        console.log("💾 Attempting to save token to localStorage...");
       localStorage.setItem('token', data.token);

        console.log("✅ localStorage.setItem completed");
        
        const savedToken = localStorage.getItem('admin_token');
        console.log("✅ Verification - Token in localStorage?", Boolean(savedToken), "Length:", savedToken?.length);
        
        if (!savedToken) {
          throw new Error("Token was not saved to localStorage");
        }
      } catch (storageError) {
        console.error("❌ localStorage error:", storageError);
        setError('Failed to save login token');
        setLoading(false);
        return;
      }

      console.log("✅ Admin logged in:", data.email);
      
      setSuccess('✅ Login successful! Redirecting...');
      setEmail('');
      setPassword('');

      // Wait to ensure token is saved, then redirect with token as fallback
      await new Promise(r => setTimeout(r, 500));
      
      // Redirect and let the page initialization save the token
      window.location.href = `/?token=${encodeURIComponent(data.token)}`;
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1115] via-[#0F1115] to-[#16181D] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-lg p-8 border border-[rgba(136,136,136,0.25)]">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#022683] to-[#033aa0] rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-[#888888]">Enter your credentials to access the dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-[#888888]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full pl-10 pr-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[#888888] mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-[#888888]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-[#E6E6E6] transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-400 text-sm">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-[#022683] to-[#033aa0] text-white rounded-lg hover:from-[#033aa0] hover:to-[#022683] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-[rgba(136,136,136,0.25)]">
            <p className="text-center text-sm text-[#888888]">
              Test credentials:
              <br />
              <span className="text-[#E6E6E6]">admin@gmail.com</span>
              <br />
              <span className="text-[#E6E6E6]">admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
