import React, { useState } from 'react';
import { api } from '../api';

const TelecallerTable = ({ staff, isAdmin }) => {
  const [showPasswords, setShowPasswords] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);
  const [details, setDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [dateFilters, setDateFilters] = useState({}); // { [userId]: { start: '', end: '' } }

  const handleDateChange = (userId, field, value) => {
    setDateFilters(prev => ({
        ...prev,
        [userId]: {
            ...prev[userId],
            [field]: value
        }
    }));
  };

  const togglePassword = (id, e) => {
    e.stopPropagation();
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleRowClick = async (id) => {
      if (expandedRow === id) {
          setExpandedRow(null);
          return;
      }

      setExpandedRow(id);
      
      if (!details[id]) {
          try {
              setLoadingDetails(true);
              const data = await api.getBusinesses({ assignedTo: id });
              setDetails(prev => ({ ...prev, [id]: data }));
          } catch (err) {
              console.error(err);
          } finally {
              setLoadingDetails(false);
          }
      }
  };

  const getFilteredAssignments = (assignments, userId) => {
      // Early return if no assignments
      if (!assignments || !Array.isArray(assignments)) return [];

      // Filter Logic
      const filters = dateFilters[userId] || {};
      const startDate = filters.start ? new Date(filters.start) : null;
      // Set end date to end of day if present
      const endDate = filters.end ? new Date(new Date(filters.end).setHours(23, 59, 59, 999)) : null;

      const filteredAssignments = assignments.filter(b => {
          if (!b) return false;
          // Use assignment date for filtering
          const date = b.assignedAt ? new Date(b.assignedAt) : new Date(0);
          
          if (startDate && date < startDate) return false;
          if (endDate && date > endDate) return false;
          
          return true;
      });

      // Sort newest first
      return filteredAssignments.sort((a, b) => {
          const dateA = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
          const dateB = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
          return dateB - dateA;
      });
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Mobile View: Scrollable Cards */}
      <div className="md:hidden flex-1 min-h-0 overflow-y-auto space-y-4 pb-20">
        {staff.map((member) => (
             <div key={member._id} className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="p-4" onClick={() => handleRowClick(member._id)}>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-white font-medium text-lg flex items-center gap-2">
                                {member.name}
                                <svg className={`w-4 h-4 text-zinc-500 transition-transform ${expandedRow === member._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </h3>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-zinc-400 font-mono">
                                    {showPasswords[member._id] ? member.password : '••••••••'}
                                </span>
                                <button 
                                    onClick={(e) => togglePassword(member._id, e)}
                                    className="text-zinc-500 hover:text-white"
                                >
                                    {showPasswords[member._id] ? 'Hide' : 'Show'}
                                </button>
                             </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                            <div className="bg-zinc-800 px-3 py-1 rounded text-xs text-zinc-300">
                                 {member.assignments} Assigned
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expanded Details Mobile */}
                {expandedRow === member._id && (
                    <div className="border-t border-zinc-800 bg-zinc-900/30 p-4">
                        {loadingDetails && !details[member._id] ? (
                            <div className="text-center py-4 text-zinc-500 text-sm">Loading details...</div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Assignments ({details[member._id]?.length})</h4>
                                    <div className="space-y-4">
                                        <div className="flex gap-2 text-xs">
                                            <input 
                                                type="date" 
                                                value={dateFilters[member._id]?.start || ''}
                                                onChange={(e) => handleDateChange(member._id, 'start', e.target.value)}
                                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 w-full outline-none focus:border-blue-500"
                                                placeholder="Start Date"
                                            />
                                            <input 
                                                type="date" 
                                                value={dateFilters[member._id]?.end || ''}
                                                onChange={(e) => handleDateChange(member._id, 'end', e.target.value)}
                                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 w-full outline-none focus:border-blue-500"
                                                placeholder="End Date"
                                            />
                                        </div>

                                        {getFilteredAssignments(details[member._id], member._id).length === 0 && (
                                            <p className="text-zinc-600 text-xs italic py-2">No assignments found based on current filters.</p>
                                        )}
                                        
                                        <div className="space-y-3">
                                            {getFilteredAssignments(details[member._id], member._id).map(b => (
                                                <div key={b._id} className="bg-zinc-800/40 rounded-lg p-3 border border-zinc-800">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h5 className="text-zinc-200 text-sm font-medium">{b.businessName}</h5>
                                                            <p className="text-zinc-500 text-xs">{b.city || "No City"}</p>
                                                        </div>
                                                        {b.registered ? (
                                                            <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/50">REG</span>
                                                        ) : (
                                                            <span className="text-[10px] bg-zinc-700/40 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700/50">PENDING</span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-500 border-t border-zinc-700/50 pt-2 mt-2">
                                                        <div>
                                                            <span className="block text-zinc-600 uppercase tracking-wider text-[9px]">Assigned</span>
                                                            <span className="font-mono">{b.assignedAt ? new Date(b.assignedAt).toLocaleDateString('en-IN') : '-'}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="block text-zinc-600 uppercase tracking-wider text-[9px]">Registered</span>
                                                            <span className="font-mono">{b.registeredAt ? new Date(b.registeredAt).toLocaleDateString('en-IN') : '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
             </div>
        ))}
      </div>

      {/* Desktop View: Scrollable Table */}
      <div className="hidden md:block w-full h-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">
        <div className="h-full overflow-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-zinc-400 border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-zinc-900">
                <th className="p-4 w-16 text-center border-b border-zinc-800 text-zinc-200 uppercase tracking-wider font-medium text-xs">S.No</th>
                <th className="p-4 border-b border-zinc-800 text-zinc-200 uppercase tracking-wider font-medium text-xs">Name</th>
                <th className="p-4 border-b border-zinc-800 text-zinc-200 uppercase tracking-wider font-medium text-xs">Password</th>
                <th className="p-4 border-b border-zinc-800 text-zinc-200 uppercase tracking-wider font-medium text-xs">Assignments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {staff.map((member, index) => (
                <React.Fragment key={member._id}>
                    <tr onClick={() => handleRowClick(member._id)} className="hover:bg-zinc-800/40 transition-colors cursor-pointer group">
                    <td className="p-4 text-center font-mono opacity-50">{index + 1}</td>
                    <td className="p-4">
                        <div className="font-medium text-white text-base flex items-center gap-2">
                            {member.name}
                            <svg className={`w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-transform ${expandedRow === member._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-zinc-300">
                                {showPasswords[member._id] ? member.password : '••••••••'}
                            </span>
                            {isAdmin && (
                                <button 
                                    onClick={(e) => togglePassword(member._id, e)}
                                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showPasswords[member._id] ? 'Hide' : 'Show'}
                                </button>
                            )}
                        </div>
                    </td>
                    <td className="p-4">
                     <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-950/30 text-blue-400 border border-blue-900/50">
                            {member.assignments || 0} Assigned
                        </span>
                     </div>
                  </td>
                    </tr>
                    {expandedRow === member._id && (
                        <tr className="bg-zinc-900/30">
                            <td colSpan="4" className="p-0 border-b border-zinc-800">
                                <div className="p-6 grid grid-cols-2 gap-8">
                                    {loadingDetails && !details[member._id] ? (
                                        <div className="col-span-2 flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white mr-3"></div>
                                            Loading details...
                                        </div>
                                    ) : (
                                        <div className="col-span-2">
                                            {/* Date-wise Assignment Table */}
                                            <div>
                                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
                                                    <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Assignments History</h4>
                                                    <div className="flex items-center gap-3">
                                                         <div className="flex gap-2 text-xs">
                                                            <input 
                                                                type="date" 
                                                                value={dateFilters[member._id]?.start || ''}
                                                                onChange={(e) => handleDateChange(member._id, 'start', e.target.value)}
                                                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 outline-none focus:border-blue-500"
                                                            />
                                                            <span className="text-zinc-600 self-center">to</span>
                                                            <input 
                                                                type="date" 
                                                                value={dateFilters[member._id]?.end || ''}
                                                                onChange={(e) => handleDateChange(member._id, 'end', e.target.value)}
                                                                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-300 outline-none focus:border-blue-500"
                                                            />
                                                        </div>

                                                        <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-900/50">
                                                            {getFilteredAssignments(details[member._id], member._id).length} Selected
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                                                     {getFilteredAssignments(details[member._id], member._id).length === 0 && (
                                                        <p className="text-center italic text-zinc-600 py-4">No assignments found matching filters.</p>
                                                    )}

                                                     {getFilteredAssignments(details[member._id], member._id).length > 0 && (
                                                        <div className="border border-zinc-800 rounded-lg overflow-hidden">
                                                            <table className="w-full text-left text-xs text-zinc-400">
                                                                <thead className="bg-zinc-900/50">
                                                                    <tr className="border-b border-zinc-800">
                                                                        <th className="p-2 font-medium text-zinc-500">Business Name</th>
                                                                        <th className="p-2 font-medium text-zinc-500">Assigned At</th>
                                                                        <th className="p-2 font-medium text-zinc-500">Registered At</th>
                                                                        <th className="p-2 font-medium text-zinc-500 text-right">Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-zinc-800/50">
                                                                    {getFilteredAssignments(details[member._id], member._id).map(b => (
                                                                        <tr key={b._id} className="hover:bg-zinc-800/20 transition-colors">
                                                                            <td className="p-2">
                                                                                <div className="text-zinc-300 font-medium">{b.businessName}</div>
                                                                                <div className="text-zinc-600 text-[10px]">{b.city || "No City"}</div>
                                                                            </td>
                                                                            <td className="p-2 font-mono text-zinc-500">
                                                                                {b.assignedAt ? new Date(b.assignedAt).toLocaleString('en-IN', { 
                                                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                                                                                }) : '-'}
                                                                            </td>
                                                                            <td className="p-2 font-mono text-zinc-500">
                                                                                {b.registeredAt ? new Date(b.registeredAt).toLocaleString('en-IN', { 
                                                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                                                                                }) : '-'}
                                                                            </td>
                                                                            <td className="p-2 text-right">
                                                                                {b.registered ? (
                                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-900/50">
                                                                                        REGISTERED
                                                                                    </span>
                                                                                ) : (
                                                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-500 border border-zinc-700">
                                                                                        PENDING
                                                                                    </span>
                                                                                )}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                     )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TelecallerTable;
