import React, { useState, useEffect } from 'react';
import { api } from '../api';

const AddBusinessModal = ({ onClose, onAdded, initialData = null, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    category: 'Computer & IT Softwares',
    phoneNumbers: [''], // Array for dynamic inputs
    ownerName: '',
    businessName: '', // Shop Name
    email: '',
    type: 'Retailer',
    website: '',
    address: '',
    pincode: '',
    city: '',
    district: '',
    state: '',
    country: '',
    registered: false
  });

  useEffect(() => {
    if (isEditMode && initialData) {
        setFormData({
            ...initialData,
            // Ensure phoneNumbers is an array
            phoneNumbers: initialData.phoneNumbers && initialData.phoneNumbers.length > 0 ? initialData.phoneNumbers : ['']
        });
    }
  }, [initialData, isEditMode]);

  const categoryOptions = [
    'Computer & IT Softwares', 'Electronics', 'Electricals', 
    'Automobiles', 'Mobiles & Accessory', 'Solar Systems', 'Other'
  ];

  const typeOptions = [
    'Retailer', 'Wholesaler', 'Distributor', 'Manufacturing Company'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handler for phone number changes
  const handlePhoneChange = (index, value) => {
    const newPhones = [...formData.phoneNumbers];
    newPhones[index] = value;
    setFormData({ ...formData, phoneNumbers: newPhones });
  };

  const addPhoneField = () => {
    // Check if the last phone number is empty or invalid
    const lastPhone = formData.phoneNumbers[formData.phoneNumbers.length - 1];
    if (!lastPhone || lastPhone.trim().length !== 10) {
        alert("Please enter a valid 10-digit mobile number before adding another.");
        return;
    }
    setFormData({ ...formData, phoneNumbers: [...formData.phoneNumbers, ''] });
  };

  const removePhoneField = (index) => {
    const newPhones = formData.phoneNumbers.filter((_, i) => i !== index);
    setFormData({ ...formData, phoneNumbers: newPhones });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Validate Phone Numbers
      const phones = formData.phoneNumbers;
      
      // Check for empty fields
      if (phones.some(p => p.trim() === '')) {
          alert("One or more mobile number fields are empty. Please fill or remove them.");
          return;
      }
      
      // Check for 10 digits
      const phoneRegex = /^[0-9]{10}$/;
      for (let phone of phones) {
          if (!phoneRegex.test(phone)) {
              alert(`Invalid phone number: ${phone}. Must be exactly 10 digits.`);
              return;
          }
      }

      if (phones.length === 0) {
          alert("Please add at least one mobile number");
          return;
      }

      // 2. Validate Pincode (Must be 6 digits)
      const pincodeRegex = /^[0-9]{6}$/;
      if (!pincodeRegex.test(formData.pincode)) {
          alert("Invalid Pincode. Must be exactly 6 digits.");
          return;
      }

      // 3. Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
          alert("Invalid Email Address.");
          return;
      }

      const payload = {
          ...formData,
          phoneNumbers: phones
      };

      if (isEditMode) {
          await api.updateBusiness(initialData._id, payload);
          alert('Business updated successfully');
      } else {
          await api.addBusiness(payload);
          alert('Business added successfully');
      }
      
      onAdded();
      onClose();
    } catch (err) {
      console.error(err);
      alert(isEditMode ? 'Failed to update business' : 'Failed to add business');
    }
  };

  const inputClass = "w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:ring-1 focus:ring-white focus:border-white outline-none transition";
  const labelClass = "block text-zinc-400 text-sm mb-1";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-xl shadow-2xl w-full max-w-2xl border border-zinc-800 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-zinc-800">
            <h2 className="text-2xl font-light tracking-tight text-white">{isEditMode ? 'Edit Business' : 'Add New Business'}</h2>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* 1. Business Category */}
            <div>
                <label className={labelClass}>Business CategoryReference</label>
                <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
                    {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            {/* 2. Mobile Phone Numbers */}
            <div>
                <label className={labelClass}>Mobile Number(s)</label>
                {formData.phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input 
                            type="tel" 
                            placeholder="Mobile No (10 digits)" 
                            value={phone} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val) && val.length <= 10) {
                                    handlePhoneChange(index, val);
                                }
                            }} 
                            className={inputClass} 
                            required={index === 0}
                        />
                        {index === formData.phoneNumbers.length - 1 ? (
                            <button type="button" onClick={addPhoneField} className="px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">+</button>
                        ) : (
                            <button type="button" onClick={() => removePhoneField(index)} className="px-4 bg-red-600/20 text-red-500 border border-red-900 rounded-lg hover:bg-red-600/30 transition">×</button>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 3. Owner Name */}
                <div>
                    <label className={labelClass}>Owner Name</label>
                    <input name="ownerName" placeholder="Owner Name" value={formData.ownerName} onChange={handleChange} className={inputClass} required />
                </div>
                {/* 4. Shop Name */}
                <div>
                    <label className={labelClass}>Shop Name</label>
                    <input name="businessName" placeholder="Shop Name" value={formData.businessName} onChange={handleChange} className={inputClass} required />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 5. Email ID */}
                <div>
                    <label className={labelClass}>E-Mail ID</label>
                    <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} className={inputClass} required />
                </div>
                {/* 6. Business Type */}
                <div>
                    <label className={labelClass}>Business Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className={inputClass}>
                        {typeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>

            {/* 7. Website URL */}
            <div>
                <label className={labelClass}>Website URL</label>
                <input name="website" placeholder="https://example.com" value={formData.website} onChange={handleChange} className={inputClass} required />
            </div>

            {/* 8. Address */}
            <div>
                <label className={labelClass}>Address</label>
                <textarea name="address" rows="2" placeholder="Full Address" value={formData.address} onChange={handleChange} className={inputClass} required />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* 9. Area Pin Code */}
                <div>
                    <label className={labelClass}>Area Pin Code</label>
                    <input 
                        name="pincode" 
                        placeholder="Pincode (6 digits)" 
                        value={formData.pincode} 
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val) && val.length <= 6) {
                                handleChange(e);
                            }
                        }}
                        className={inputClass} 
                        required 
                    />
                </div>
                {/* 10. City */}
                <div>
                    <label className={labelClass}>City</label>
                    <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className={inputClass} required />
                </div>
                {/* 11. District */}
                <div>
                    <label className={labelClass}>District</label>
                    <input name="district" placeholder="District" value={formData.district} onChange={handleChange} className={inputClass} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* 12. State */}
                <div>
                    <label className={labelClass}>State</label>
                    <input name="state" placeholder="State" value={formData.state} onChange={handleChange} className={inputClass} required />
                </div>
                {/* 13. Country */}
                <div>
                    <label className={labelClass}>Country</label>
                    <input name="country" placeholder="Country" value={formData.country} onChange={handleChange} className={inputClass} required />
                </div>
            </div>

            {/* 14. Registered Status */}
            <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                <input 
                    type="checkbox" 
                    id="registered"
                    name="registered" 
                    checked={formData.registered} 
                    onChange={(e) => setFormData({ ...formData, registered: e.target.checked })}
                    className="w-5 h-5 accent-white rounded cursor-pointer" 
                />
                <label htmlFor="registered" className="text-zinc-300 font-medium cursor-pointer select-none">
                    Mark as Registered Business
                </label>
            </div>

            </form>
        </div>
        
        {/* 14. Footer with Save Button - Outside scrollable area */}
        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3 bg-zinc-900 rounded-b-xl">
            <button type="button" onClick={onClose} className="px-6 py-2 text-zinc-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleSubmit} type="button" className="px-8 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10">Save</button>
        </div>
      </div>
    </div>
  );
};

export default AddBusinessModal;
