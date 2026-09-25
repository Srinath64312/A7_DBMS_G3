import React, { useState } from 'react';
import { Address } from '../types';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  activeAddressId: string;
  onSelectAddress: (addressId: string) => void;
  onAddAddress: (newAddress: Address) => void;
  onDeleteAddress?: (addressId: string) => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  addresses,
  activeAddressId,
  onSelectAddress,
  onAddAddress,
  onDeleteAddress
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [postalCode, setPostalCode] = useState('500075');
  const [phone, setPhone] = useState('+91 98480 12345');
  const [label, setLabel] = useState('Campus Hostel');

  if (!isOpen) return null;

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !street.trim()) return;

    const newAddr: Address = {
      id: `addr_${Date.now()}`,
      label: label.trim() || 'Delivery Location',
      fullName: fullName.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      phone: phone.trim()
    };

    onAddAddress(newAddr);
    onSelectAddress(newAddr.id);
    setIsAdding(false);
    // Reset form
    setFullName('');
    setStreet('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-[#d5d9d9] dark:border-slate-800 rounded-xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl text-[#0f1111] dark:text-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-500 border border-amber-500/40 flex items-center justify-center text-base">
              <i className="fa-solid fa-location-dot"></i>
            </div>
            <div>
              <h3 className="text-base font-bold">Choose Delivery Location</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select your active delivery address or add a new campus location
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {!isAdding ? (
            <>
              {/* Address List */}
              <div className="space-y-3">
                {addresses.map(addr => {
                  const isActive = addr.id === activeAddressId;

                  return (
                    <div
                      key={addr.id}
                      onClick={() => onSelectAddress(addr.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                        isActive
                          ? 'border-amber-500 bg-amber-500/10 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900 dark:text-white">
                              {addr.fullName}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-slate-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                              {addr.label}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono">
                                ACTIVE
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            {addr.street}
                          </div>
                          <div className="text-xs text-gray-500">
                            {addr.city}, {addr.state} — <span className="font-mono font-bold">{addr.postalCode}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono">
                            <i className="fa-solid fa-phone text-[10px] mr-1"></i>
                            {addr.phone}
                          </div>
                        </div>

                        {/* Radio selection visual */}
                        <div className="shrink-0 pt-0.5">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isActive
                              ? 'border-amber-500 bg-amber-500 text-slate-950'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}>
                            {isActive && <i className="fa-solid fa-check text-[10px]"></i>}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAddress(addr.id);
                            onClose();
                          }}
                          className={`font-bold ${isActive ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                        >
                          {isActive ? '✓ Selected for Delivery' : 'Deliver to this Address'}
                        </button>

                        {onDeleteAddress && addresses.length > 1 && !addr.isDefault && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteAddress(addr.id);
                            }}
                            className="text-gray-400 hover:text-rose-500 transition text-[11px]"
                            title="Delete address"
                          >
                            <i className="fa-solid fa-trash-can mr-1"></i> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Address Button */}
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-500/5 text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <i className="fa-solid fa-plus text-amber-500"></i>
                <span>Add a New Delivery Address</span>
              </button>
            </>
          ) : (
            /* Add Address Form */
            <form onSubmit={handleAddNewAddress} className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-slate-800">
                <span className="font-bold text-sm">Add New Delivery Location</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Address Label:</label>
                  <select
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  >
                    <option value="Campus Hostel">Campus Hostel</option>
                    <option value="Faculty Residence">Faculty Residence</option>
                    <option value="Research Lab">Research Lab / CSE Dept</option>
                    <option value="Tech Park">Tech Park / Office</option>
                    <option value="Home">Home Address</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Full Name / Recipient:</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Abhinay Sai"
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Street Address / Building & Room:</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Room 402, Block 3, Aziz Nagar Campus"
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">City:</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">State:</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">PIN / Postal Code:</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-1">Phone Number for Delivery SMS:</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  className="a-button a-button-primary flex-1 py-2 font-bold"
                >
                  Save & Use This Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="a-button a-button-subtle px-4 py-2 font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span>Deliveries are fulfilled from the nearest regional warehouse hub</span>
          <button
            onClick={onClose}
            className="a-button a-button-primary px-5 py-1.5 font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
