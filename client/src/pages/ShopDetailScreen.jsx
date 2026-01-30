import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import AddBusinessModal from '../components/AddBusinessModal'; // Will receive edit props

const ShopDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const data = await api.getBusinessById(id);
      setBusiness(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load business details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      {/* Header / Nav */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
        >
          ← Back to Dashboard
        </button>
        
        <button 
          onClick={() => setShowEditModal(true)}
          className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
        >
          Edit Business
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title Section */}
        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
             <div>
                <h1 className="text-3xl font-light text-white mb-2">{business.businessName}</h1>
                <div className="flex flex-wrap gap-2 text-sm">
                    <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">{business.type}</span>
                    <span className="px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-400 border border-zinc-800">{business.category}</span>
                    {business.registered ? (
                        <span className="px-3 py-1 rounded-full bg-emerald-950/30 text-emerald-400 border border-emerald-900/50">Registered</span>
                    ) : (
                        <span className="px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-500 border border-zinc-800">Unregistered</span>
                    )}
                </div>
             </div>
             
             <div className="text-right hidden md:block">
                 <div className="text-zinc-500 text-sm font-mono">ID: {business._id}</div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner Info */}
            <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-medium text-zinc-300 mb-4 border-b border-zinc-800 pb-2">Owner Information</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-wide">Name</label>
                        <div className="text-white text-lg">{business.ownerName}</div>
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-wide">Email</label>
                        <div className="text-zinc-300">{business.email}</div>
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-wide">Phone Numbers</label>
                        <div className="flex flex-col gap-1 mt-1">
                            {business.phoneNumbers.map((phone, idx) => (
                                <a key={idx} href={`tel:${phone}`} className="text-blue-400 hover:text-blue-300 font-mono transition-colors w-fit">
                                    {phone}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Location & Contact */}
            <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-medium text-zinc-300 mb-4 border-b border-zinc-800 pb-2">Location & Details</h3>
                <div className="space-y-4">
                     <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-wide">Address</label>
                        <div className="text-zinc-300 whitespace-pre-wrap">{business.address}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs text-zinc-500 uppercase tracking-wide">City</label>
                             <div className="text-white">{business.city}</div>
                        </div>
                        <div>
                             <label className="block text-xs text-zinc-500 uppercase tracking-wide">Pincode</label>
                             <div className="text-white font-mono">{business.pincode}</div>
                        </div>
                        <div>
                             <label className="block text-xs text-zinc-500 uppercase tracking-wide">State</label>
                             <div className="text-white">{business.state}</div>
                        </div>
                         <div>
                             <label className="block text-xs text-zinc-500 uppercase tracking-wide">Country</label>
                             <div className="text-white">{business.country}</div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-zinc-500 uppercase tracking-wide">Website</label>
                        {business.website ? (
                             <a href={business.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 truncate block mt-1">
                                {business.website}
                             </a>
                        ) : (
                            <span className="text-zinc-600 italic">Not provided</span>
                        )}
                    </div>
                </div>
            </div>
        </div>

        {/* Staff Assignment Info if needed */}
         {business.assignedTo && (
            <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800">
                <h3 className="text-lg font-medium text-zinc-300 mb-4 border-b border-zinc-800 pb-2">Internal Assignment</h3>
                <div className="flex items-center gap-4">
                     <div className="h-10 w-10 rounded-full bg-indigo-900/30 flex items-center justify-center text-indigo-400 font-bold border border-indigo-900/50">
                        {/* Initials or Icon */}
                        Assign
                     </div>
                     <div>
                         <div className="text-sm text-zinc-400">Assigned To</div>
                         {/* We might need to populate this field in the backend to see the name, currently getting ID might be default unless populated */}
                         <div className="text-white font-mono text-sm">{typeof business.assignedTo === 'object' ? business.assignedTo.name : business.assignedTo}</div>
                     </div>
                </div>
                {business.assignmentMessage && (
                    <div className="mt-4 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-sm text-zinc-400 italic">
                        "{business.assignmentMessage}"
                    </div>
                )}
            </div>
        )}
      </div>

      {showEditModal && (
          <AddBusinessModal 
            onClose={() => setShowEditModal(false)}
            onAdded={() => {
                fetchBusiness();
                // setShowEditModal(false); // Handled by Modal likely but good to ensure re-fetch
            }}
            initialData={business} // Pass current data for editing
            isEditMode={true}
          />
      )}
    </div>
  );
};

export default ShopDetailScreen;
