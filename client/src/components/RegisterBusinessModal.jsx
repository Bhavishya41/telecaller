import React, { useState } from 'react';

const RegisterBusinessModal = ({ onClose, onRegister, selectedCount }) => {
  const [followup, setFollowup] = useState('');
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    setRegistering(true);
    // Pass the followup message back to the parent
    await onRegister(followup);
    setRegistering(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md border border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-light tracking-tight text-white">Register Businesses</h2>
            <p className="text-zinc-500 text-sm mt-1">Marking <span className="text-white font-medium">{selectedCount}</span> businesses as Registered.</p>
        </div>
        
        <div className="p-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-zinc-400 text-sm mb-2">Followup Message (Optional)</label>
                    <textarea 
                        value={followup} 
                        onChange={(e) => setFollowup(e.target.value)}
                        placeholder="Add a note about the registration (e.g., client feedback, next steps)..."
                        rows="4"
                        className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white outline-none focus:ring-1 focus:ring-white focus:border-white transition resize-none"
                    ></textarea>
                </div>
            </div>
        </div>
        
        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900 rounded-b-xl">
            <button onClick={onClose} className="px-5 py-2 text-zinc-400 hover:text-white transition-colors text-sm">Cancel</button>
            <button 
                onClick={handleRegister} 
                disabled={registering}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
                {registering ? 'Registering...' : 'Confirm Registration'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterBusinessModal;
