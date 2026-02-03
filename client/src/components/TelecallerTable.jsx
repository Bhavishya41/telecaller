import React, { useState } from 'react';

const TelecallerTable = ({ staff, isAdmin }) => {
  const [showPasswords, setShowPasswords] = useState({});

  const togglePassword = (id) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Mobile View: Scrollable Cards */}
      <div className="md:hidden flex-1 min-h-0 overflow-y-auto space-y-4 pb-20">
        {staff.map((member) => (
             <div key={member._id} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-white font-medium text-lg">{member.name}</h3>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-zinc-400 font-mono">
                                {showPasswords[member._id] ? member.password : '••••••••'}
                            </span>
                            <button 
                                onClick={() => togglePassword(member._id)}
                                className="text-zinc-500 hover:text-white"
                            >
                                {showPasswords[member._id] ? 'Hide' : 'Show'}
                            </button>
                         </div>
                    </div>
                    <div className="bg-zinc-800 px-3 py-1 rounded text-xs text-zinc-300">
                        {member.assignments} Assignments
                    </div>
                </div>
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
                <tr key={member._id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="p-4 text-center font-mono opacity-50">{index + 1}</td>
                  <td className="p-4">
                    <div className="font-medium text-white text-base">{member.name}</div>
                  </td>
                  <td className="p-4">
                     <div className="flex items-center gap-3">
                        <span className="font-mono text-zinc-300">
                            {showPasswords[member._id] ? member.password : '••••••••'}
                        </span>
                        {isAdmin && (
                            <button 
                                onClick={() => togglePassword(member._id)}
                                className="text-xs text-zinc-500 hover:text-white transition-colors"
                            >
                                {showPasswords[member._id] ? 'Hide' : 'Show'}
                            </button>
                        )}
                     </div>
                  </td>
                  <td className="p-4">
                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-950/30 text-blue-400 border border-blue-900/50">
                        {member.assignments || 0} Businesses
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TelecallerTable;
