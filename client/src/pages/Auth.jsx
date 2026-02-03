import React, { useState } from 'react';
import { api } from '../api';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pincode: '',
    password: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      let data;
      if (isLogin) {
        data = await api.login(formData);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data)); // Data now includes role from backend
        window.location.href = '/dashboard';
      } else {
        data = await api.register(formData);
        alert('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 className="text-3xl font-light text-white text-center mb-2 tracking-tight">
          {isLogin ? 'Welcome Back' : 'Join Us'}
        </h2>
        <p className="text-zinc-500 text-center mb-8 text-sm">
          {isLogin ? 'Enter your credentials to access your dashboard' : 'Create an account to get started'}
        </p>
        
        {error && <div className="bg-red-900/20 text-red-500 border border-red-900/50 p-3 rounded mb-6 text-center text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:ring-1 focus:ring-white focus:border-white outline-none transition duration-200"
                required
              />
              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:ring-1 focus:ring-white focus:border-white outline-none transition duration-200"
                required
              />
              <input
                type="text"
                name="pincode"
                placeholder="Pincode (Locations)"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:ring-1 focus:ring-white focus:border-white outline-none transition duration-200"
                required
              />
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:ring-1 focus:ring-white focus:border-white outline-none transition duration-200"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 focus:ring-1 focus:ring-white focus:border-white outline-none transition duration-200 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-medium py-3 rounded-lg hover:bg-zinc-200 transition-all duration-200 mt-6"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-zinc-500 text-center mt-8 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-white hover:underline hover:text-zinc-300 font-medium transition cursor-pointer"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
