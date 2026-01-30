import React from 'react';
import BusinessCard from './BusinessCard';
import { useNavigate } from 'react-router-dom';

const BusinessTable = ({ businesses, selectedIds, onToggleSelect, onToggleAll }) => {
  const isAllSelected = businesses.length > 0 && selectedIds.length === businesses.length;
  const navigate = useNavigate();

  const handleRowClick = (e, id) => {
    // Prevent navigation if clicking on checkbox, links, or specific action elements
    if (e.target.type === 'checkbox' || e.target.closest('input') || e.target.closest('a') || e.target.closest('button')) return;
    navigate(`/shop/${id}`);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Mobile View: Scrollable Cards */}
      <div className="md:hidden overflow-y-auto space-y-4 pb-20">
        {businesses.length > 0 && (
             <div className="flex items-center justify-between px-1 mb-2 sticky top-0 bg-black py-2 z-10">
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                    <input 
                        type="checkbox" 
                        checked={isAllSelected}
                        onChange={onToggleAll}
                        className="appearance-none w-5 h-5 border border-zinc-600 rounded-full bg-transparent checked:bg-zinc-500 checked:border-zinc-500 cursor-pointer transition-all relative"
                    />
                    Select All
                </label>
             </div>
        )}
        
        {businesses.map((biz) => (
            <BusinessCard 
                key={biz._id}
                business={biz}
                isSelected={selectedIds.includes(biz._id)}
                onToggle={onToggleSelect}
            />
        ))}
      </div>

      {/* Desktop View: Scrollable Table */}
      <div className="hidden md:block w-full h-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm">
        <div className="h-full overflow-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-zinc-400 border-separate border-spacing-0">
            <thead className="sticky top-0 z-20">
              <tr className="bg-zinc-900">
                <th className="p-4 w-10 border-b border-zinc-800">
                  <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      onChange={onToggleAll}
                      className="appearance-none w-5 h-5 border border-zinc-600 rounded-full bg-transparent checked:bg-zinc-500 checked:border-zinc-500 cursor-pointer transition-all relative"
                  />
                </th>
                <th className="p-4 w-16 text-center border-b border-zinc-800 text-zinc-200 uppercase tracking-wider font-medium text-xs">S.No</th>
                <th className="p-4 border-b border-zinc-800 text-zinc-200 uppercase tracking-wider font-medium text-xs">Business Details</th>
                <th className="p-4 border-b border-zinc-800 text-zinc-200 uppercase tracking-wider font-medium text-xs">Owner Info</th>
                <th className="p-4 border-b border-zinc-800 text-zinc-200 uppercase tracking-wider font-medium text-xs">Contact</th>
                <th className="p-4 border-b border-zinc-800 text-zinc-200 uppercase tracking-wider font-medium text-xs">Location</th>
                <th className="p-4 text-center border-b border-zinc-800 text-zinc-200 uppercase tracking-wider font-medium text-xs">Status</th>
                <th className="p-4 border-b border-zinc-800 text-zinc-200 uppercase tracking-wider font-medium text-xs">Message</th>
                <th className="p-4 border-b border-zinc-800 text-zinc-200 uppercase tracking-wider font-medium text-xs">Followup</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {businesses.map((biz, index) => {
                const isSelected = selectedIds.includes(biz._id);
                return (
                  <tr 
                      key={biz._id} 
                      onClick={(e) => handleRowClick(e, biz._id)}
                      className={`hover:bg-zinc-800/40 transition-colors cursor-pointer ${isSelected ? 'bg-zinc-800/60' : ''}`}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => onToggleSelect(biz._id)}
                          className="appearance-none w-5 h-5 border border-zinc-600 rounded-full bg-transparent checked:bg-zinc-500 checked:border-zinc-500 cursor-pointer transition-all relative"
                      />
                    </td>
                    <td className="p-4 text-center font-mono opacity-50">
                        {index + 1}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-white text-base truncate max-w-[200px]">{biz.businessName}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">{biz.type}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-800">{biz.category}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-zinc-200 truncate max-w-[150px]">{biz.ownerName}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 truncate max-w-[150px]">{biz.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                          {biz.phoneNumbers?.slice(0, 2).map((phone, idx) => (
                              <span key={idx} className="text-zinc-400 font-mono text-xs">{phone}</span>
                          ))}
                          {biz.phoneNumbers?.length > 2 && (
                              <span className="text-[10px] text-zinc-600">+{biz.phoneNumbers.length - 2} more</span>
                          )}
                          {biz.website && (
                               <a href={biz.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-blue-500 hover:underline mt-1">Visit Website</a>
                          )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-zinc-300 text-xs">{biz.city}, {biz.state}</div>
                      <div className="text-[10px] text-zinc-600 mt-0.5 truncate max-w-[120px]" title={biz.address}>{biz.address}</div>
                    </td>
                    <td className="p-4 text-center">
                      {biz.registered ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-emerald-950/30 text-emerald-400 border border-emerald-900/50">
                              Registered
                          </span>
                      ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium bg-zinc-800 text-zinc-500 border border-zinc-700">
                              Unregistered
                          </span>
                      )}
                    </td>
                    <td className="p-4">
                       <div className="max-w-[120px] truncate text-xs text-zinc-400" title={biz.assignmentMessage}>
                          {biz.assignmentMessage || '-'}
                       </div>
                    </td>
                    <td className="p-4">
                        <div className="max-w-[120px] truncate text-xs text-zinc-400" title={biz.followup}>
                          {biz.followup || '-'}
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BusinessTable;