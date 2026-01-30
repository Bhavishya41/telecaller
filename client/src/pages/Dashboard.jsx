import React, { useEffect, useState, useRef } from 'react';
import BusinessTable from '../components/BusinessTable';
import AddBusinessModal from '../components/AddBusinessModal';
import AssignStaffModal from '../components/AssignStaffModal';
import RegisterBusinessModal from '../components/RegisterBusinessModal';
import { api } from '../api';
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const [businesses, setBusinesses] = useState([]);
  const [user, setUser] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState([]);

  const [filters, setFilters] = useState({
      city: '',
      state: '',
      category: 'All',
      type: 'All',
      registered: 'All'
  });

  const [searchTerm, setSearchTerm] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchBusinesses(userData, filters);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        const tagName = document.activeElement.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || document.activeElement.isContentEditable) {
            return;
        }

        if (user.role === 'admin') {
            e.preventDefault();
            setShowModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const handleFilterChange = (e) => {
      const newFilters = { ...filters, [e.target.name]: e.target.value };
      setFilters(newFilters);
      fetchBusinesses(user, newFilters, searchTerm);
  };

  const fetchBusinesses = async (currentUser = user, currentFilters = filters, search = searchTerm) => {
    try {
        setLoading(true);
        let params = {};
        
        if (currentUser.role === 'admin') {
            params = { ...currentFilters };
            if (params.category === 'All') delete params.category;
            if (params.type === 'All') delete params.type;
            if (params.registered === 'All') delete params.registered;
            if (search) params.search = search;
        } else {
            params = { assignedTo: currentUser._id || currentUser.id };
        }
        
        const data = await api.getBusinesses(params);
        setBusinesses(data);
        setSelectedIds([]); 
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
  };

  const toggleSelect = (id) => {
      setSelectedIds(prev => 
          prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
      );
  };

  const toggleSelectAll = () => {
      if (selectedIds.length === businesses.length) {
          setSelectedIds([]);
      } else {
          setSelectedIds(businesses.map(b => b._id));
      }
  };

  const categoryOptions = ['All', 'Computer & IT Softwares', 'Electronics', 'Electricals', 'Automobiles', 'Mobiles & Accessory', 'Solar Systems', 'Other'];
  const typeOptions = ['All', 'Retailer', 'Wholesaler', 'Distributor', 'Manufacturing Company'];

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} business(es)?`)) return;
    try {
        setLoading(true);
        await Promise.all(selectedIds.map(id => api.deleteBusiness(id)));
        await fetchBusinesses();
        setSelectedIds([]);
        alert("Operations completed successfully.");
    } catch (err) {
        alert("Some items could not be deleted.");
    } finally {
        setLoading(false);
    }
  };

  const handleConfirmRegister = async (followupMessage) => {
    try {
        setLoading(true);
        await Promise.all(selectedIds.map(id => api.updateBusiness(id, { 
            registered: true,
            followup: followupMessage
        })));
        await fetchBusinesses();
        setSelectedIds([]);
        alert("Businesses marked as registered successfully.");
    } catch (err) {
        alert("Failed to update status.");
    } finally {
        setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (businesses.length === 0) return alert("No businesses to export.");
    const ws = XLSX.utils.json_to_sheet(businesses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Businesses");
    XLSX.writeFile(wb, "businesses.xlsx");
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
        try {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            
            if (data.length === 0) return alert("No data found.");

            const formattedData = data.map(item => ({
                ...item,
                phoneNumbers: item.phoneNumbers ? String(item.phoneNumbers).split(',').map(p => p.trim()) : [],
                businessName: item.businessName || "Unknown",
                ownerName: item.ownerName || "Unknown",
                email: item.email || "noemail@provided.com",
                pincode: String(item.pincode || ""),
                category: item.category || "Other",
                type: item.type || "Retailer",
                country: item.country || "India"
            }));

            setLoading(true);
            await api.importBusinesses(formattedData);
            alert(`Successfully imported ${formattedData.length} businesses`);
            await fetchBusinesses();
        } catch (err) {
            alert("Import failed.");
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Navigation - Fixed Height */}
      <nav className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 shrink-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-light tracking-tight">
                TeleConnect {user.role === 'admin' && <span className="text-[10px] bg-red-900/50 text-red-200 px-2 py-0.5 rounded border border-red-900 ml-2 align-middle">ADMIN</span>}
            </h1>
            
            {user.role === 'admin' && (
                <div className="hidden md:flex flex-1 max-w-lg mx-8">
                    <div className="relative w-full group">
                         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </span>
                        <input 
                            type="text" 
                            placeholder="Search by Name or Phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchBusinesses(user, filters, searchTerm)}
                            className="w-full bg-zinc-800/50 border border-zinc-700 text-zinc-200 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:bg-zinc-800 focus:border-zinc-500 transition-all placeholder:text-zinc-600"
                        />
                    </div>
                </div>
            )}
            <div className="flex items-center gap-6">
                <span className="text-zinc-400 hidden md:block text-sm">
                    Hello, <b className="text-white font-medium">{user.name}</b>
                </span>
                {user.role === "admin" && (
                    <button onClick={() => setShowModal(true)} className="bg-white text-black hover:bg-zinc-200 px-4 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-2">
                        + Add Business
                    </button>
                )}
                <button onClick={() => fetchBusinesses()} className="text-zinc-500 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Refresh
                </button>
                <button onClick={handleLogout} className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">Logout</button>
            </div>
        </div>
      </nav>
      
      {/* Main Content Area - Constrained to prevent page scroll */}
      <main className="flex-1 flex flex-col min-h-0 w-full max-w-7xl mx-auto p-4 md:p-6">
          
          {/* Header & Filters Section - Stays at top */}
          <div className="shrink-0 space-y-4 mb-4">
              {user.role === 'admin' ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 mb-1 md:hidden">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </span>
                                <input 
                                    type="text" 
                                    placeholder="Search by Name or Phone..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchBusinesses(user, filters, searchTerm)}
                                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600"
                                />
                            </div>
                            <button 
                                onClick={() => fetchBusinesses(user, filters, searchTerm)}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-indigo-900/20"
                            >
                                Search
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-zinc-900/90 p-4 rounded-xl border border-zinc-800 shadow-xl">
                            <input name="city" placeholder="City" value={filters.city} onChange={handleFilterChange} className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:border-zinc-600 outline-none" />
                            <input name="state" placeholder="State" value={filters.state} onChange={handleFilterChange} className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:border-zinc-600 outline-none" />
                            <select name="category" value={filters.category} onChange={handleFilterChange} className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm outline-none">
                                {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <select name="type" value={filters.type} onChange={handleFilterChange} className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm outline-none">
                                {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            <select name="registered" value={filters.registered} onChange={handleFilterChange} className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm outline-none">
                                <option value="All">All Status</option>
                                <option value="true">Registered</option>
                                <option value="false">Unregistered</option>
                            </select>
                        </div>
                    </div>
              ) : (
                <div className="flex items-center justify-between">
                    <h2 className="text-xl text-zinc-400 font-light">Assignments for <span className="text-white font-normal">{user.pincode}</span></h2>
                </div>
              )}

                {/* Bulk Actions Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60 gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-zinc-400">
                            <b className="text-zinc-100">{businesses.length}</b> items
                        </span>
                        {selectedIds.length > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                                <span className="text-sm text-indigo-400 font-medium">{selectedIds.length} selected</span>
                                <button onClick={() => setSelectedIds([])} className="text-xs text-zinc-500 hover:text-white underline ml-1">Clear</button>
                            </>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        {user.role === 'admin' ? (
                            <>
                                <button disabled={selectedIds.length === 0} onClick={() => setShowAssignModal(true)} className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${selectedIds.length > 0 ? 'bg-indigo-600/10 text-indigo-400 border-indigo-600/30 hover:bg-indigo-600/20' : 'opacity-30 cursor-not-allowed'}`}>
                                    Assign
                                </button>
                                <button disabled={selectedIds.length === 0} onClick={handleDelete} className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${selectedIds.length > 0 ? 'bg-red-900/10 text-red-500 border-red-900/30 hover:bg-red-900/20' : 'opacity-30 cursor-not-allowed'}`}>
                                    Delete
                                </button>
                                <button disabled={businesses.length === 0} onClick={handleExportToExcel} className="flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold border bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700">
                                    Export
                                </button>
                                <button onClick={handleImportClick} className="flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold border bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700">
                                    Import
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls" className="hidden" />
                            </>
                        ) : (
                            <button disabled={selectedIds.length === 0} onClick={() => setShowRegisterModal(true)} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all border ${selectedIds.length > 0 ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500 shadow-lg shadow-emerald-900/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed'}`}>
                                Register Selection ({selectedIds.length})
                            </button>
                        )}
                    </div>
                </div>
          </div>

          {/* Table Container - This part scrolls */}
          <div className="flex-1 min-h-0 relative">
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                        <span className="text-zinc-500 text-sm font-mono animate-pulse">Loading Database...</span>
                    </div>
                </div>
            ) : businesses.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center bg-zinc-900/20 border border-zinc-800/50 rounded-2xl border-dashed">
                    <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-zinc-800">
                        <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <p className="text-zinc-500 font-light text-lg">No businesses found</p>
                    <p className="text-zinc-600 text-sm mt-1">Try adjusting your filters or adding new data.</p>
                </div>
            ) : (
                <BusinessTable 
                    businesses={businesses}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onToggleAll={toggleSelectAll}
                />
            )}
          </div>
      </main>

      {/* Modals */}
      {showModal && <AddBusinessModal onClose={() => setShowModal(false)} onAdded={() => fetchBusinesses()} />}
      {showAssignModal && <AssignStaffModal onClose={() => setShowAssignModal(false)} onAssigned={() => { fetchBusinesses(); setSelectedIds([]); }} selectedCount={selectedIds.length} businessIds={selectedIds} />}
      {showRegisterModal && <RegisterBusinessModal onClose={() => setShowRegisterModal(false)} onRegister={handleConfirmRegister} selectedCount={selectedIds.length} />}
    </div>
  );
};

export default Dashboard;   