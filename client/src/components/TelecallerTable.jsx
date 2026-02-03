import React, { useState } from 'react';
import { api } from '../api';

const TelecallerTable = ({ staff, isAdmin }) => {
  const [showPasswords, setShowPasswords] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);
  const [details, setDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

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
                                    <ul className="space-y-1">
                                        {details[member._id]?.length === 0 && <li className="text-zinc-600 text-xs italic">No assignments</li>}
                                        {details[member._id]?.map(b => (
                                            <li key={b._id} className="text-sm text-zinc-400 pl-2 border-l-2 border-zinc-700">{b.businessName}</li>
                                        ))}
                                    </ul>
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
                                            {/* Assigned Column Only */}
                                            <div>
                                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
                                                    <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Assigned Businesses</h4>
                                                    <span className="text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded border border-blue-900/50">
                                                        {details[member._id]?.length || 0}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                     {details[member._id]?.length === 0 && (
                                                        <p className="text-zinc-600 text-sm italic py-2 col-span-full">No assignments.</p>
                                                    )}
                                                    {details[member._id]?.map(b => (
                                                        <div key={b._id} className={`p-3 rounded-lg border ${b.registered ? 'bg-emerald-900/5 border-emerald-900/20' : 'bg-zinc-800/30 border-zinc-700/50'}`}>
                                                            <div className="flex justify-between items-start mb-1">
                                                                <div className={`font-medium text-sm ${b.registered ? 'text-emerald-300' : 'text-zinc-300'}`}>{b.businessName}</div>
                                                                {b.registered && <span className="text-[10px] uppercase bg-emerald-900/50 text-emerald-200 px-1.5 py-0.5 rounded">REG</span>}
                                                            </div>
                                                            <div className="text-zinc-500 text-xs flex flex-col gap-0.5">
                                                                <span>{b.city || "No City"}</span>
                                                                {b.phoneNumbers?.[0] && <span>{b.phoneNumbers[0]}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
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
