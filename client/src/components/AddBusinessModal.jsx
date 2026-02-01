import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';

const AddBusinessModal = ({ onClose, onAdded, initialData = null, isEditMode = false }) => {
  const [formData, setFormData] = useState({
    category: 'Computer & IT Softwares',
    phoneNumbers: [''], // Array for dynamic inputs
    ownerName: '',
    businessName: '', // Shop Name
    email: '',
    type: ['Retailer'], // Changed to array
    website: '',
    address: '',
    pincode: '',
    city: '',
    district: '',
    state: '',
    country: '',
    registered: false
  });

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);

  const fieldRefs = useRef({});
  const saveBtnRef = useRef(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
        if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
            setIsTypeDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isEditMode && initialData) {
        let normalizedType = [];
        if (Array.isArray(initialData.type)) {
            normalizedType = initialData.type;
        } else if (typeof initialData.type === 'string') {
            normalizedType = [initialData.type];
        }

        setFormData({
            ...initialData,
            // Ensure phoneNumbers is an array
            phoneNumbers: initialData.phoneNumbers && initialData.phoneNumbers.length > 0 ? initialData.phoneNumbers : [''],
            type: normalizedType.length > 0 ? normalizedType : ['Retailer']
        });
    }
  }, [initialData, isEditMode]);

  // Pincode Lookup Effect
  useEffect(() => {
    if (formData.pincode.length === 6) {
        const fetchPincodeDetails = async () => {
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
                const data = await response.json();
                
                if (data && data[0].Status === "Success") {
                    const place = data[0].PostOffice[0];
                    setFormData(prev => ({
                        ...prev,
                        city: place.Block !== "NA" ? place.Block : place.District, // Fallback to District if Block is NA
                        district: place.District,
                        state: place.State,
                        country: place.Country || 'India'
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch pincode details:", err);
            }
        };
        fetchPincodeDetails();
    }
  }, [formData.pincode]);

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

  const handleTypeChange = (option) => {
      setFormData(prev => {
          const currentTypes = prev.type;
          if (currentTypes.includes(option)) {
              return { ...prev, type: currentTypes.filter(t => t !== option) };
          } else {
              return { ...prev, type: [...currentTypes, option] };
          }
      });
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

  const handleKeyDown = (e, nextFieldKey, isLastField = false) => {
      if (e.key === 'Enter') {
          e.preventDefault();
          
          if (isLastField) {
              // Special case for Checkbox -> Save Button
              if(saveBtnRef.current) saveBtnRef.current.focus();
              return;
          }

          const nextEl = fieldRefs.current[nextFieldKey];
          if (nextEl) {
              nextEl.focus();
          }
      }
  };
  
  // Special handler for Checkbox
  const handleCheckboxKeyDown = (e) => {
    if (e.key === 'Space' || e.key === ' ') {
        e.preventDefault();
        // Toggle manually
        setFormData(prev => ({ ...prev, registered: !prev.registered }));
        // Move selection to Save button (requested behavior)
        if(saveBtnRef.current) saveBtnRef.current.focus();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if(saveBtnRef.current) saveBtnRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      // Filter out empty phone numbers
      const phones = formData.phoneNumbers.filter(p => p.trim() !== '');
      
      // Check if at least one field is filled
      const textFields = ['ownerName', 'businessName', 'email', 'website', 'address', 'pincode', 'city', 'district', 'state', 'country'];
      const isAnyTextFieldFilled = textFields.some(field => formData[field]?.trim() !== '');
      const isAnyPhoneFilled = phones.length > 0;

      if (!isAnyTextFieldFilled && !isAnyPhoneFilled) {
          alert("Please fill at least one field to add a business.");
          return;
      }

      // 1. Validate Phone Numbers (Only if provided)
      const phoneRegex = /^[0-9]{10}$/;
      for (let phone of phones) {
          if (!phoneRegex.test(phone)) {
              alert(`Invalid phone number: ${phone}. Must be exactly 10 digits.`);
              return;
          }
      }

      // 2. Validate Pincode (Only if provided)
      if (formData.pincode && formData.pincode.trim() !== '') {
          const pincodeRegex = /^[0-9]{6}$/;
          if (!pincodeRegex.test(formData.pincode)) {
              alert("Invalid Pincode. Must be exactly 6 digits.");
              return;
          }
      }

      // 3. Validate Email (Only if provided)
      if (formData.email && formData.email.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData.email)) {
              alert("Invalid Email Address.");
              return;
          }
      }

      const payload = {
          ...formData,
          phoneNumbers: phones
      };

      if (isEditMode) {
          await api.updateBusiness(initialData._id, payload);
          alert('Business updated successfully');
          onAdded();
          onClose();
      } else {
          await api.addBusiness(payload);
          alert('Business added successfully');
          onAdded(); // Refresh parent list
          
          // Reset logic for continuous adding
          setFormData({
            category: formData.category, // Keep category default
            phoneNumbers: [''], 
            ownerName: '',
            businessName: '',
            email: '',
            type: formData.type, // Keep type default
            website: '',
            address: '',
            pincode: formData.pincode, // Keep pincode (likely same area)
            city: formData.city, // Keep city
            district: formData.district,
            state: formData.state,
            country: formData.country,
            registered: false
          });
          
          // Focus mobile number specifically as requested
          setTimeout(() => {
              if (fieldRefs.current['phone_0']) {
                  fieldRefs.current['phone_0'].focus();
              }
          }, 0);
      }
      
    } catch (err) {
      console.error(err);
      alert(isEditMode ? 'Failed to update business' : 'Failed to add business');
    }
  };

  const inputClass = "w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:ring-1 focus:ring-white focus:border-white outline-none transition";
  const labelClass = "block text-zinc-400 text-sm mb-1";

  // Helper to assign refs
  const setRef = (key) => (el) => {
      fieldRefs.current[key] = el;
      // Also maintain array refs for phones if needed, but handled dynamically below
  };

  const toggleTypeDropdown = () => {
      setIsTypeDropdownOpen(!isTypeDropdownOpen);
  };

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
                <select 
                    ref={setRef('category')}
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    onKeyDown={(e) => handleKeyDown(e, 'phone_0')}
                    className={inputClass}
                >
                    {categoryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>

            {/* 2. Mobile Phone Numbers */}
            <div>
                {formData.phoneNumbers.map((phone, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input 
                            ref={(el) => fieldRefs.current[`phone_${index}`] = el}
                            type="tel" 
                            placeholder="Mobile No (10 digits)" 
                            value={phone} 
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val) && val.length <= 10) {
                                    handlePhoneChange(index, val);
                                }
                            }}
                            onKeyDown={(e) => {
                                // If enter is pressed on last phone, go to ownerName
                                // If not last phone, go to next phone
                                const nextKey = index === formData.phoneNumbers.length - 1 ? 'ownerName' : `phone_${index + 1}`;
                                handleKeyDown(e, nextKey);
                            }}
                            className={inputClass} 
                        />
                        {index === formData.phoneNumbers.length - 1 ? (
                            <button type="button" onClick={addPhoneField} tabIndex={-1} className="px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">+</button>
                        ) : (
                            <button type="button" onClick={() => removePhoneField(index)} tabIndex={-1} className="px-4 bg-red-600/20 text-red-500 border border-red-900 rounded-lg hover:bg-red-600/30 transition">×</button>
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 3. Owner Name */}
                <div>
                    <input 
                        ref={setRef('ownerName')}
                        name="ownerName" 
                        placeholder="Owner Name" 
                        value={formData.ownerName} 
                        onChange={handleChange} 
                        onKeyDown={(e) => handleKeyDown(e, 'businessName')}
                        className={inputClass} 
                    />
                </div>
                {/* 4. Shop Name */}
                <div>
                    <input 
                        ref={setRef('businessName')}
                        name="businessName" 
                        placeholder="Shop Name" 
                        value={formData.businessName} 
                        onChange={handleChange} 
                        onKeyDown={(e) => handleKeyDown(e, 'email')}
                        className={inputClass} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 5. Email ID */}
                <div>
                    <input 
                        ref={setRef('email')}
                        name="email" 
                        type="email" 
                        placeholder="Email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        onKeyDown={(e) => handleKeyDown(e, 'type')}
                        className={inputClass} 
                    />
                </div>
                {/* 6. Business Type */}
            {/* 6. Business Type (Multi-select) */}
            <div className="relative" ref={typeDropdownRef}>
                <div 
                    className={`${inputClass} cursor-pointer flex items-center justify-between`}
                    onClick={toggleTypeDropdown}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') toggleTypeDropdown();
                        if (e.key === 'Tab' && !isTypeDropdownOpen) handleKeyDown(e, 'website');
                    }}
                >
                    <span className={formData.type.length === 0 ? "text-zinc-600" : "text-white"}>
                        {formData.type.length > 0 ? formData.type.join(', ') : 'Select Type'}
                    </span>
                    <span className="text-zinc-400">▼</span>
                </div>
                
                {isTypeDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
                        {typeOptions.map(opt => (
                            <label key={opt} className="flex items-center gap-3 p-3 hover:bg-zinc-800 cursor-pointer transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={formData.type.includes(opt)}
                                    onChange={() => handleTypeChange(opt)}
                                    className="w-4 h-4 accent-white rounded bg-zinc-800 border-zinc-600"
                                />
                                <span className="text-zinc-300 text-sm">{opt}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>
            </div>

            {/* 7. Website URL */}
            <div>
                <input 
                    ref={setRef('website')}
                    name="website" 
                    placeholder="https://example.com" 
                    value={formData.website} 
                    onChange={handleChange} 
                    onKeyDown={(e) => handleKeyDown(e, 'address')}
                    className={inputClass} 
                />
            </div>

            {/* 8. Address */}
            <div>
                <textarea 
                    ref={setRef('address')}
                    name="address" 
                    rows="2" 
                    placeholder="Full Address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    onKeyDown={(e) => handleKeyDown(e, 'pincode')}
                    className={inputClass} 
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* 9. Area Pin Code */}
                <div>
                    <input 
                        ref={setRef('pincode')}
                        name="pincode" 
                        placeholder="Pincode (6 digits)" 
                        value={formData.pincode} 
                        onChange={(e) => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val) && val.length <= 6) {
                                handleChange(e);
                            }
                        }}
                        onKeyDown={(e) => handleKeyDown(e, 'city')}
                        className={inputClass} 
                    />
                </div>
                {/* 10. City */}
                <div>
                    <input 
                        ref={setRef('city')}
                        name="city" 
                        placeholder="City" 
                        value={formData.city} 
                        onChange={handleChange} 
                        onKeyDown={(e) => handleKeyDown(e, 'district')}
                        className={inputClass} 
                    />
                </div>
                {/* 11. District */}
                <div>
                    <input 
                        ref={setRef('district')}
                        name="district" 
                        placeholder="District" 
                        value={formData.district} 
                        onChange={handleChange} 
                        onKeyDown={(e) => handleKeyDown(e, 'state')}
                        className={inputClass} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* 12. State */}
                <div>
                    <input 
                        ref={setRef('state')}
                        name="state" 
                        placeholder="State" 
                        value={formData.state} 
                        onChange={handleChange} 
                        onKeyDown={(e) => handleKeyDown(e, 'country')}
                        className={inputClass} 
                    />
                </div>
                {/* 13. Country */}
                <div>
                    <input 
                        ref={setRef('country')}
                        name="country" 
                        placeholder="Country" 
                        value={formData.country} 
                        onChange={handleChange} 
                        onKeyDown={(e) => handleKeyDown(e, 'registered')}
                        className={inputClass} 
                    />
                </div>
            </div>

            {/* 14. Registered Status */}
            <div className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                <input 
                    ref={setRef('registered')}
                    type="checkbox" 
                    id="registered"
                    name="registered" 
                    checked={formData.registered} 
                    onChange={handleChange}
                    onKeyDown={handleCheckboxKeyDown}
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
            <button 
                ref={saveBtnRef}
                onClick={handleSubmit} 
                type="button" 
                className="px-8 py-2 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
            >
                Save
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddBusinessModal;
