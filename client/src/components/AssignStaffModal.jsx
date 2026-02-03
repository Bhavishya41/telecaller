import React, { useEffect, useState } from 'react';
import { api } from '../api';

const AssignStaffModal = ({ onClose, onAssigned, selectedCount, businessIds }) => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const data = await api.getStaff();
      setStaffList(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaff) return;
    try {
      setAssigning(true);
      await api.assignBusinesses({
        businessIds: businessIds,
        staffId: selectedStaff,
        message: message
      });
      onAssigned();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to assign businesses');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md border border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
            <h2 className="text-xl font-light tracking-tight text-white">Assign Businesses</h2>
            <p className="text-zinc-500 text-sm mt-1">Assigning <span className="text-white font-medium">{selectedCount}</span> selected businesses to a staff member.</p>
        </div>
        
        <div className="p-6">
            {loading ? (
                <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
            ) : staffList.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">No staff members found.</p>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-zinc-400 text-sm mb-2">Select Staff Member</label>
                        <select 
                            value={selectedStaff} 
                            onChange={(e) => setSelectedStaff(e.target.value)}
                            className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white outline-none focus:ring-1 focus:ring-white focus:border-white transition"
                        >
                            <option value="">-- Choose Staff --</option>
                            {staffList.map(staff => (
                                <option key={staff._id} value={staff._id}>{staff.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-zinc-400 text-sm mb-2">Message (Optional)</label>
                        <textarea 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Add a note for the staff member..."
                            rows="3"
                            className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white outline-none focus:ring-1 focus:ring-white focus:border-white transition resize-none"
                        ></textarea>
                    </div>
                </div>
            )}
        </div>
        
        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900 rounded-b-xl">
            <button onClick={onClose} className="px-5 py-2 text-zinc-400 hover:text-white transition-colors text-sm">Cancel</button>
            <button 
                onClick={handleAssign} 
                disabled={!selectedStaff || assigning || staffList.length === 0}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
                {assigning ? 'Assigning...' : 'Confirm Assignment'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AssignStaffModal;
