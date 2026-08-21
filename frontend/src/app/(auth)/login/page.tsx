'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call for login
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="bg-[#0c1018]/90 backdrop-blur-xl border border-[#1a2334] p-8 rounded-2xl shadow-2xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-2">Secure Login</h2>
        <p className="text-sm text-slate-400">Authenticate to access the command center.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Agency Email / ID</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
              <Mail size={16} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-2.5 bg-[#05080f] border border-[#1a2334] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-sm"
              placeholder="operator@agency.gov"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
            <Link href="#" className="text-xs text-orange-500 hover:text-orange-400 transition-colors">Forgot Password?</Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
              <Lock size={16} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-2.5 bg-[#05080f] border border-[#1a2334] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <input 
            type="checkbox" 
            id="remember" 
            className="w-4 h-4 rounded border-[#1a2334] bg-[#05080f] text-orange-600 focus:ring-orange-500/50 focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer select-none">Remember this device</label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all shadow shadow-orange-900/20"
        >
          {isLoading ? (
            <><Loader2 size={18} className="animate-spin" /> Authenticating...</>
          ) : (
            <>Secure Login <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        New agency onboarding? <Link href="/register" className="text-white hover:text-orange-400 font-medium transition-colors">Request Access</Link>
      </div>
    </div>
  );
}
