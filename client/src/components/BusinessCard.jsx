import React from 'react';

const BusinessCard = ({ business, isSelected, onToggle }) => {
  return (
    <div 
        onClick={() => onToggle(business._id)}
        className={`relative border rounded-xl p-6 mb-4 transition-all duration-300 group cursor-pointer ${
            isSelected 
            ? 'bg-zinc-800/80 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
        }`}
    >
      <div className="absolute top-6 right-6 z-10">
        <input 
            type="checkbox" 
            checked={isSelected}
            onChange={() => {}} // Handled by div click
            className="appearance-none w-5 h-5 border border-zinc-600 rounded-full bg-transparent checked:bg-indigo-500 checked:border-indigo-500 cursor-pointer transition-all"
        />
      </div>

      <div className="flex justify-between items-start pr-8">
        <div>
          <h3 className="text-xl font-medium text-white group-hover:text-zinc-200 transition-colors">{business.businessName}</h3>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-sm text-zinc-500">{business.type}</span>
             <span className="text-zinc-700">•</span>
             <span className="text-sm text-zinc-500">{business.category}</span>
          </div>
          <div className="text-xs text-zinc-600 mt-1">
            {business.address}, {business.city}, {business.state}
          </div>
        </div>
      </div>
      
      <div className="mt-6 space-y-3">
        <div className="flex justify-between border-b border-zinc-800 pb-2">
            <span className="text-zinc-500 text-sm">Owner</span>
            <span className="text-zinc-300 text-sm">{business.ownerName}</span>
        </div>
        <div className="flex justify-between border-b border-zinc-800 pb-2">
            <span className="text-zinc-500 text-sm">Email</span>
            <span className="text-zinc-300 text-sm">{business.email}</span>
        </div>
        {business.registered && (
            <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500 text-sm">Status</span>
                <span className="text-emerald-400 text-sm font-medium">Registered</span>
            </div>
        )}
        {business.website && (
            <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500 text-sm">Website</span>
                <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noreferrer" 
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-500 text-sm hover:text-blue-400"
                >
                    Visit Link ↗
                </a>
            </div>
        )}
        <div className="pt-1">
          <span className="text-zinc-500 text-sm block mb-2">Phone Numbers</span>
          <div className="flex flex-wrap gap-2">
            {business.phoneNumbers.map((phone, idx) => (
               <a 
                key={idx} 
                href={`tel:${phone}`} 
                onClick={(e) => e.stopPropagation()}
                className="text-zinc-300 hover:text-white bg-zinc-950 border border-zinc-800 px-3 py-1 rounded text-sm transition-colors hover:border-zinc-600"
               >
                {phone}
               </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
