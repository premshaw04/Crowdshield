'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Mail, User, Shield, ArrowRight } from 'lucide-react';
import { authService } from '@/lib/services/auth/auth.service';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    agency: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      await authService.register({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password 
      });
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#0c1018]/90 backdrop-blur-xl border border-[#1a2334] p-8 rounded-2xl shadow-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Request Access</h2>
        <p className="text-sm text-slate-400">Onboard new personnel or agencies to CrowdShield.</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
            {errorMsg}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
                <User size={14} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full pl-9 pr-3 py-2 bg-[#05080f] border border-[#1a2334] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Agency/Dept</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
                <Shield size={14} />
              </div>
              <input
                type="text"
                name="agency"
                value={formData.agency}
                onChange={handleChange}
                required
                className="block w-full pl-9 pr-3 py-2 bg-[#05080f] border border-[#1a2334] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-sm"
                placeholder="NYPD Dept 12"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Official Email</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
              <Mail size={14} />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="block w-full pl-9 pr-3 py-2 bg-[#05080f] border border-[#1a2334] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-sm"
              placeholder="operator@agency.gov"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
              <Lock size={14} />
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="block w-full pl-9 pr-3 py-2 bg-[#05080f] border border-[#1a2334] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Confirm Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-orange-500 transition-colors">
              <Lock size={14} />
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="block w-full pl-9 pr-3 py-2 bg-[#05080f] border border-[#1a2334] rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex items-start gap-2 mt-4 pt-2">
          <input 
            type="checkbox" 
            id="tos" 
            required
            className="mt-1 w-4 h-4 rounded border-[#1a2334] bg-[#05080f] text-orange-600 focus:ring-orange-500/50 focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="tos" className="text-xs text-slate-400 cursor-pointer select-none leading-relaxed">
            I acknowledge I am an authorized personnel. Unauthorized access attempts are logged and reported.
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-600/50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all shadow shadow-orange-900/20"
        >
          {isLoading ? (
            <><Loader2 size={16} className="animate-spin" /> Processing Clearance...</>
          ) : (
            <>Request Access <ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-400">
        Already cleared? <Link href="/login" className="text-white hover:text-orange-400 font-medium transition-colors">Secure Login</Link>
      </div>
    </div>
  );
}
