import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Lock, AlertCircle, Sparkles, Shield, ArrowRight } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a2a] text-white flex items-center justify-center px-4 py-8 relative overflow-hidden font-sans">
    {/* Animated Gradient Background */}
    <div className="absolute inset-0 z-0">
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-purple-600/50 to-blue-600/50 rounded-full blur-3xl opacity-30 animate-[spin_20s_linear_infinite]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-cyan-600/50 to-teal-600/50 rounded-full blur-3xl opacity-30 animate-[spin_25s_linear_infinite_reverse]"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-indigo-700/50 to-purple-700/50 rounded-full blur-3xl opacity-20 animate-[spin_15s_linear_infinite]"></div>
    </div>
     {/* Dot pattern overlay */}
     <div className="absolute inset-0 z-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)',
        backgroundSize: '30px 30px'
      }}></div>


    <div className="relative z-10 w-full max-w-md mx-auto">
      {/* Login Card */}
      <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
           <div className="flex justify-center">
             <div className="relative">
               <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg border border-white/10">
                 <Sparkles className="w-10 h-10 text-white/90" />
               </div>
             </div>
           </div>
           <div className="space-y-1">
             <h1 className="text-3xl font-bold text-white tracking-tight">
               Golden Success
             </h1>
             <p className="text-lg font-medium text-slate-300">Dashboard</p>
           </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm text-start font-medium text-slate-400 block tracking-wide">
              Username
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 transition-all duration-300"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-start font-medium text-slate-400 block tracking-wide">
                Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors duration-300" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="w-full pl-12 pr-12 py-3 bg-slate-800/60 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 transition-all duration-300"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-500 hover:text-indigo-300 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-500 hover:text-indigo-300 transition-colors" />
                )}
              </div>
            </div>
          </div>


          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500/30 rounded-lg p-3 flex items-center gap-3 animate-pulse">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
        
         {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs pt-4">
          <Shield className="w-4 h-4" />
          <span>Secure & Encrypted Connection</span>
        </div>

      </div>

      {/* Professional Footer */}
      <div className="text-center mt-8">
          <p className="text-sm text-slate-500 font-medium">
            © 2024 Golden Success. All Rights Reserved.
          </p>
      </div>
    </div>
  </div>
  );
};

export default Login;
