import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

// This is the component for both Adding and Editing Festivals
const FestivalFormModal = ({ isOpen, onClose, onSave, event }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // This effect runs whenever the modal opens or the event to edit changes.
    if (isOpen) {
      if (event) {
        // If an event is passed, we are in "Edit" mode.
        // Pre-populate the form with the event's data.
        setFormData({
          ...event,
          // Ensure the date is in YYYY-MM-DD format for the input field
          accurate_date: new Date(event.start).toISOString().split('T')[0],
        });
      } else {
        // If no event is passed, we are in "Add" mode.
        // Reset the form to its initial empty state.
        setFormData({
          event_name: '',
          location: '',
          accurate_date: new Date().toISOString().split('T')[0],
          time: '',
          type: 'Cultural',
          summary: '',
          hook_intro: '',
        });
      }
    }
  }, [isOpen, event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Validation for required fields
    const requiredFields = ['event_name', 'location', 'accurate_date', 'type'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        alert(`Please fill out the required field: ${field.replace('_', ' ')}`);
        return;
      }
    }
    // The onSave function now receives the event ID if we are editing
    onSave(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg m-4 outline-none max-h-[90vh] overflow-y-auto"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {/* The title changes based on whether we are adding or editing */}
        {event ? 'Edit Festival' : 'Add New Festival'}
      </h2>
      <div className="space-y-4">
        {/* Form Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Festival Name</label>
          <input type="text" name="event_name" value={formData.event_name || ''} onChange={handleChange} className="mt-1 w-full form-input text-gray-600" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="mt-1 w-full form-input text-gray-600" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <input type="text" name="type" value={formData.type || ''} onChange={handleChange} className="mt-1 w-full form-input text-gray-600" required />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" name="accurate_date" value={formData.accurate_date || ''} onChange={handleChange} className="mt-1 w-full form-input text-gray-600" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Time (Optional)</label>
            <input type="time" name="time" value={formData.time || ''} onChange={handleChange} className="mt-1 w-full form-input text-gray-600" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea name="summary" value={formData.summary || ''} onChange={handleChange} rows="3" className="mt-1 w-full form-input text-gray-600"></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hook / Intro Line (Optional)</label>
          <input type="text" name="hook_intro" value={formData.hook_intro || ''} onChange={handleChange} className="mt-1 w-full form-input text-gray-600" />
        </div>
      </div>
      <div className="mt-8 flex justify-end space-x-3">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Save Festival</button>
      </div>
    </Modal>
  );
};

// Correctly export the component
export default FestivalFormModal;