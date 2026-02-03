import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ user, searchTerm, onSearchChange, onSearchSubmit, onRefresh, onAddBusiness, onShowTeam, showTeam }) => {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
    };

    return (
      <nav className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 shrink-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center gap-4">
            <h1 className="text-xl md:text-2xl font-light tracking-tight truncate shrink min-w-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                TeleConnect {user.role === 'admin' && <span className="hidden md:inline text-[10px] bg-red-900/50 text-red-200 px-2 py-0.5 rounded border border-red-900 align-middle">ADMIN</span>}
            </h1>
            
            {/* Search Bar - Only show if props provided (e.g. on Dashboard) */}
            {user.role === 'admin' && onSearchChange && (
                <div className="hidden md:flex flex-1 max-w-lg mx-8">
                    <div className="relative w-full group">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search by Name or Phone..." 
                            value={searchTerm || ''}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit && onSearchSubmit()}
                            className="w-full bg-zinc-800/50 border border-zinc-700 text-zinc-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:bg-zinc-800 focus:border-zinc-500 transition-all placeholder:text-zinc-600"
                        />
                    </div>
                </div>
            )}
            
            <div className="flex items-center gap-3 md:gap-6 shrink-0">
                {/* Navigation Links */}
                {user.role === 'admin' && (
                     <button onClick={onShowTeam} className={`hidden md:flex transition-colors text-sm font-medium items-center gap-2 ${showTeam ? 'text-white' : 'text-zinc-500 hover:text-white'}`}>
                        <span>Team</span>
                    </button>
                )}

                <span className="text-zinc-400 hidden md:block text-sm border-l border-zinc-800 pl-6">
                    Hello, <b className="text-white font-medium">{user.name}</b>
                </span>
                
                {user.role === "admin" && onAddBusiness && (
                    <button onClick={onAddBusiness} className="bg-white text-black hover:bg-zinc-200 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-2 shadow-lg shadow-white/5">
                        <span className="md:hidden"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg></span>
                        <span className="hidden md:inline">+ Add Business</span>
                    </button>
                )}
                
                {onRefresh && (
                    <button onClick={onRefresh} className="text-zinc-500 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                        <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span className="hidden md:inline">Refresh</span>
                    </button>
                )}
                
                <button onClick={handleLogout} className="text-red-900/60 hover:text-red-500 transition-colors text-sm font-medium">
                    <span className="hidden md:inline">Logout</span>
                    <span className="md:hidden"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></span>
                </button>
            </div>
        </div>
      </nav>
    );
};

export default Navbar;
