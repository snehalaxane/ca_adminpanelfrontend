import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}
interface LoginResponse {
  message?: string;
  token?: string;
  success?: boolean;
}



export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
const [loading, setLoading] = useState(false);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
 console.log("API BASE URL =", API_BASE_URL);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
        credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    let data: { message?: string; success?: boolean } = {};

    try {
      data = await 
      res.json();
    } catch {}

    if (!res.ok) {
      setError(data.message || "Invalid credentials");
      return;
    }

    // ✅ SUCCESS
    onLogin();
    localStorage.setItem("adminAuth", "true");
  } catch (err) {
    console.error("NETWORK ERROR:", err);
    setError("Unable to connect to server");
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F1115] via-[#12141A] to-[#16181D] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#16181D] to-[#1a1d24] rounded-lg shadow-2xl w-full max-w-md p-8 border border-[rgba(136,136,136,0.25)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#022683] to-[#033aa0] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-[#888888]">Raju & Prasad – Chartered Accountants</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-white placeholder:text-[rgba(136,136,136,0.5)] transition-all duration-300 hover:border-[#888888]"
                placeholder="admin@rajuprasad.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0F1115] border border-[rgba(136,136,136,0.25)] rounded-lg focus:ring-2 focus:ring-[#022683] focus:border-[#022683] outline-none text-white placeholder:text-[rgba(136,136,136,0.5)] transition-all duration-300 hover:border-[#888888]"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="text-right">
            <a href="#" className="text-sm text-[#888888] hover:text-white transition-colors duration-300">
              Forgot Password?
            </a>
          </div>

{error && (
  <p className="text-red-500 text-sm text-center">
    {error}
  </p>
)}

         <button
  type="submit"
  disabled={loading}
  className="w-full bg-gradient-to-r from-[#022683] to-[#033aa0] text-white py-3 rounded-lg font-medium transition-all duration-300
             disabled:opacity-60 disabled:cursor-not-allowed"
>
  {loading ? "Logging in..." : "Secure Login"}
</button>

        </form>

        <div className="mt-6 text-center text-xs text-[rgba(136,136,136,0.7)]">
          © 2026 Raju & Prasad – Chartered Accountants
        </div>
      </div>
    </div>
  );
}
