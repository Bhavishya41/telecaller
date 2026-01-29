import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchBusinesses(userData, filters);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Shift + N
      if (e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        // Prevent triggering if user is typing in an input/textarea
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
      fetchBusinesses(user, newFilters);
  };

  const fetchBusinesses = async (currentUser = user, currentFilters = filters) => {
    try {
        let params = {};
        
        if (currentUser.role === 'admin') {
            params = { ...currentFilters };
            // Remove 'All' or empty values
            if (params.category === 'All') delete params.category;
            if (params.type === 'All') delete params.type;
            if (params.registered === 'All') delete params.registered;
        } else {
            // Staff view: only show assigned businesses
            params = { assignedTo: currentUser._id || currentUser.id };
        }
        
        const data = await api.getBusinesses(params);
        setBusinesses(data);
        setSelectedIds([]); // Reset selection on new fetch
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

  // Selection Logic
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
        // Execute deletions in parallel
        await Promise.all(selectedIds.map(id => api.deleteBusiness(id)));
        
        await fetchBusinesses(); // Refresh list
        setSelectedIds([]); // Clear selection
        alert("Operations completed successfully.");
    } catch (err) {
        console.error(err);
        alert("Some items could not be deleted.");
    } finally {
        setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    setShowRegisterModal(true);
  };

  const handleConfirmRegister = async (followupMessage) => {
    try {
        setLoading(true);
        // Execute updates in parallel
        await Promise.all(selectedIds.map(id => api.updateBusiness(id, { 
            registered: true,
            followup: followupMessage
        })));
        
        await fetchBusinesses(); // Refresh list
        setSelectedIds([]); // Clear selection
        alert("Businesses marked as registered successfully.");
    } catch (err) {
        console.error(err);
        alert("Failed to update status.");
    } finally {
        setLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (businesses.length === 0) {
        alert("No businesses to export.");
        return;
    }
    const ws = XLSX.utils.json_to_sheet(businesses);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Businesses");
    XLSX.writeFile(wb, "businesses.xlsx");
  };

  const fileInputRef = React.useRef(null);

  const handleImportClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
        try {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            
            if (data.length === 0) {
                alert("No data found in the file.");
                return;
            }

            // Transformation to match Schema
            const formattedData = data.map(item => ({
                ...item,
                phoneNumbers: item.phoneNumbers ? String(item.phoneNumbers).split(',').map(p => p.trim()) : [],
                // Ensure required fields are at least present as empty strings if missing (backend validation will still apply)
                businessName: item.businessName || "Unknown",
                ownerName: item.ownerName || "Unknown",
                email: item.email || "noemail@provided.com",
                pincode: String(item.pincode || ""),
                category: item.category || "Other",
                type: item.type || "Retailer",
                address: item.address || "",
                city: item.city || "",
                state: item.state || "",
                country: item.country || "India"
            }));

            setLoading(true);
            await api.importBusinesses(formattedData);
            alert(`Successfully imported ${formattedData.length} businesses`);
            await fetchBusinesses();
        } catch (err) {
            console.error(err);
            alert("Failed to import businesses. Check console for details.");
        } finally {
            setLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-light tracking-tight text-white">
                TeleConnect {user.role === 'admin' && <span className="text-xs bg-red-900/50 text-red-200 px-2 py-0.5 rounded border border-red-900 ml-2">ADMIN</span>}
            </h1>
            <div className="flex items-center gap-6">
                <span className="text-zinc-400 hidden md:flex items-center gap-2 text-sm">
                    Hello, <b className="text-white font-medium">{user.name}</b>
                </span>
                {user.role === "admin" ? (<button 
                    onClick={() => setShowModal(true)}
                    className="bg-white text-black hover:bg-zinc-200 px-5 py-2 rounded-lg transition-all duration-200 shadow-lg shadow-white/5 flex items-center gap-2 font-medium text-sm"
                >
                    <span className="text-lg leading-none">+</span> Add Business
                </button>) : null}
                
                <button 
                    onClick={handleLogout}
                    className="text-zinc-500 hover:text-white transition-colors text-sm font-medium"
                >
                    Logout
                </button>
            </div>
        </div>
      </nav>
      
      {/* Content */}
      <main className="max-w-7xl mx-auto p-6 md:p-8">
          <div className="mb-8 space-y-4">
              {user.role === 'admin' ? (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 mb-6">
                        <input name="city" placeholder="Filter by City" value={filters.city} onChange={handleFilterChange} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm outline-none focus:border-zinc-600" />
                        <input name="state" placeholder="Filter by State" value={filters.state} onChange={handleFilterChange} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm outline-none focus:border-zinc-600" />
                        <select name="category" value={filters.category} onChange={handleFilterChange} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm outline-none focus:border-zinc-600">
                            {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select name="type" value={filters.type} onChange={handleFilterChange} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm outline-none focus:border-zinc-600">
                            {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <select name="registered" value={filters.registered || 'All'} onChange={handleFilterChange} className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm outline-none focus:border-zinc-600">
                            <option value="All">All Status</option>
                            <option value="true">Registered</option>
                            <option value="false">Not Registered</option>
                        </select>
                    </div>
              ) : (
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl text-zinc-400 font-light">Assignments in your area</h2>
                    <span className="font-mono bg-zinc-900 border border-zinc-800 px-3 py-1 rounded text-sm text-zinc-300 shadow-sm">{user.pincode}</span>
                </div>
              )}

                {/* Persistent Action Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 mb-6 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <h3 className="text-zinc-400 font-medium text-sm">
                            {selectedIds.length === 0 ? 'No selection' : `${selectedIds.length} selected`}
                        </h3>
                        {selectedIds.length > 0 && (
                            <button 
                                onClick={() => setSelectedIds([])}
                                className="text-xs text-zinc-500 hover:text-white underline decoration-zinc-700 hover:decoration-white transition-all"
                            >
                                Clear Selection
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {user.role === 'admin' ? (
                            <>
                                <button 
                                    disabled={selectedIds.length === 0}
                                    onClick={() => setShowAssignModal(true)} 
                                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                        selectedIds.length > 0 
                                        ? 'bg-indigo-600/10 text-indigo-400 border-indigo-600/20 hover:bg-indigo-600/20 hover:border-indigo-600/50' 
                                        : 'bg-zinc-800/50 text-zinc-600 border-zinc-800 cursor-not-allowed'
                                    }`}
                                >
                                    Assign ({selectedIds.length})
                                </button>
                                
                                <button 
                                    disabled={selectedIds.length === 0}
                                    onClick={() => {}}
                                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                        selectedIds.length > 0 
                                        ? 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700 hover:text-white' 
                                        : 'bg-zinc-800/50 text-zinc-600 border-zinc-800 cursor-not-allowed'
                                    }`}
                                >
                                    Edit ({selectedIds.length})
                                </button>

                                <button 
                                    disabled={selectedIds.length === 0}
                                    onClick={handleDelete}
                                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                        selectedIds.length > 0 
                                        ? 'bg-red-900/20 text-red-500 border-red-900/30 hover:bg-red-900/30 hover:border-red-900/50' 
                                        : 'bg-zinc-800/50 text-zinc-600 border-zinc-800 cursor-not-allowed'
                                    }`}
                                >
                                    Delete ({selectedIds.length})
                                </button>
                                
                                <button 
                                    disabled={businesses.length === 0}
                                    onClick={handleExportToExcel}
                                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                        businesses.length > 0 
                                        ? 'bg-green-900/20 text-green-500 border-green-900/30 hover:bg-green-900/30 hover:border-green-900/50' 
                                        : 'bg-zinc-800/50 text-zinc-600 border-zinc-800 cursor-not-allowed'
                                    }`}
                                >
                                    Export to Excel
                                </button>

                                <button 
                                    onClick={handleImportClick}
                                    className="flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border bg-blue-900/20 text-blue-500 border-blue-900/30 hover:bg-blue-900/30 hover:border-blue-900/50"
                                >
                                    Import from Excel
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    accept=".xlsx, .xls" 
                                    className="hidden" 
                                />
                            </>
                        ) : (
                            <button 
                                disabled={selectedIds.length === 0}
                                onClick={handleRegisterClick}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                                    selectedIds.length > 0 
                                    ? 'bg-emerald-900/20 text-emerald-500 border-emerald-900/30 hover:bg-emerald-900/30 hover:border-emerald-900/50' 
                                    : 'bg-zinc-800/50 text-zinc-600 border-zinc-800 cursor-not-allowed'
                                }`}
                            >
                                Register ({selectedIds.length})
                            </button>
                        )}
                    </div>
                </div>
          </div>

          {loading ? (
             <div className="flex justify-center py-20">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
             </div>
          ) : businesses.length === 0 ? (
              <div className="text-center py-24 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl border-dashed">
                  <p className="text-xl text-zinc-500 font-light">No businesses assigned to you right now</p>
              </div>
          ) : (
             <BusinessTable 
                businesses={businesses}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onToggleAll={toggleSelectAll}
             />
          )}
      </main>

      {showModal && (
          <AddBusinessModal 
            onClose={() => setShowModal(false)} 
            onAdded={fetchBusinesses} 
          />
      )}

      {showAssignModal && (
          <AssignStaffModal
             onClose={() => setShowAssignModal(false)}
             onAssigned={() => {
                 fetchBusinesses();
                 setSelectedIds([]);
             }}
             selectedCount={selectedIds.length}
             businessIds={selectedIds}
          />
      )}

      {showRegisterModal && (
          <RegisterBusinessModal
            onClose={() => setShowRegisterModal(false)}
            onRegister={handleConfirmRegister}
            selectedCount={selectedIds.length}
          />
      )}
    </div>
  );
};

export default Dashboard;
