import React from 'react';
import BusinessCard from './BusinessCard';
import { useNavigate } from 'react-router-dom';

const BusinessTable = ({ businesses, selectedIds, onToggleSelect, onToggleAll }) => {
  const isAllSelected = businesses.length > 0 && selectedIds.length === businesses.length;
  const navigate = useNavigate();

  const handleRowClick = (e, id) => {
    // Prevent navigation if clicking on checkbox or actions
    if (e.target.type === 'checkbox' || e.target.closest('input')) return;
    navigate(`/shop/${id}`);
  };

  return (
    <div className="w-full">
      {/* Mobile View: Cards */}
      <div className="md:hidden space-y-4">
        {businesses.length > 0 && (
             <div className="flex items-center justify-between px-1 mb-2">
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

        {businesses.length === 0 && (
            <div className="text-center py-12 text-zinc-500 bg-zinc-900/20 rounded-xl border border-zinc-800 border-dashed">
                No businesses found matching your filters.
            </div>
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm h-[600px] flex flex-col">
        <div className="overflow-auto custom-scrollbar flex-1 relative">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-900/95 text-zinc-200 uppercase tracking-wider font-medium text-xs border-b border-zinc-800 sticky top-0 z-20">
              <tr>
                <th className="p-4 w-10">
                  <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      onChange={onToggleAll}
                      className="appearance-none w-5 h-5 border border-zinc-600 rounded-full bg-transparent checked:bg-zinc-500 checked:border-zinc-500 cursor-pointer transition-all relative"
                  />
                </th>
                <th className="p-4 w-16 text-center">S.No</th>
                <th className="p-4">Business Details</th>
                <th className="p-4">Owner Info</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Location</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Message</th>
                <th className="p-4">Followup</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {businesses.map((biz, index) => {
                const isSelected = selectedIds.includes(biz._id);
                return (
                  <tr 
                      key={biz._id} 
                      onClick={(e) => handleRowClick(e, biz._id)}
                      className={`hover:bg-zinc-900/60 transition-colors cursor-pointer ${isSelected ? 'bg-zinc-900/60' : ''}`}
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
                      <div className="font-medium text-white text-base">{biz.businessName}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">{biz.type}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-800">{biz.category}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-zinc-200">{biz.ownerName}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{biz.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                          {biz.phoneNumbers.slice(0, 2).map((phone, idx) => (
                              <span key={idx} className="text-zinc-400 font-mono text-xs">{phone}</span>
                          ))}
                          {biz.phoneNumbers.length > 2 && (
                              <span className="text-xs text-zinc-600">+{biz.phoneNumbers.length - 2} more</span>
                          )}
                          {biz.website && (
                               <a href={biz.website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-blue-500 hover:text-blue-400 mt-1 inline-block">Visit Website</a>
                          )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-zinc-300">{biz.city}, {biz.state}</div>
                      <div className="text-xs text-zinc-500 mt-0.5 font-mono">{biz.pincode}</div>
                      <div className="text-xs text-zinc-600 mt-0.5 truncate max-w-[150px]" title={biz.address}>{biz.address}</div>
                    </td>
                    <td className="p-4 text-center">
                      {biz.registered ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/30 text-emerald-400 border border-emerald-900/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Registered
                          </span>
                      ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-500 border border-zinc-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> Unregistered
                          </span>
                      )}
                    </td>
                    <td className="p-4">
                       {biz.assignmentMessage ? (
                          <div className="group relative">
                              <span className="text-zinc-300 block truncate max-w-[150px] cursor-pointer group-hover:hidden">
                                  {biz.assignmentMessage}
                              </span>
                              
                              <div className="hidden group-hover:block absolute right-0 top-1/2 -translate-y-1/2 z-50 w-64 bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-xl text-zinc-200 text-xs whitespace-normal min-w-max md:min-w-[200px]">
                                  {biz.assignmentMessage}
                              </div>
                          </div>
                       ) : (
                           <span className="text-zinc-600 italic text-xs">-</span>
                       )}
                    </td>
                    <td className="p-4">
                       {biz.followup ? (
                          <div className="group relative">
                              <span className="text-zinc-300 block truncate max-w-[150px] cursor-pointer group-hover:hidden">
                                  {biz.followup}
                              </span>
                              
                              <div className="hidden group-hover:block absolute right-0 top-1/2 -translate-y-1/2 z-50 w-64 bg-zinc-900 border border-zinc-700 p-3 rounded-lg shadow-xl text-zinc-200 text-xs whitespace-normal min-w-max md:min-w-[200px]">
                                  {biz.followup}
                              </div>
                          </div>
                       ) : (
                           <span className="text-zinc-600 italic text-xs">-</span>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {businesses.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                  No businesses found matching your filters.
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessTable;
