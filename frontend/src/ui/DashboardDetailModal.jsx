import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const DashboardDetailModal = ({ event, isOpen, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Jab bhi naya event select ho, form data ko update karein
  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        accurate_date: new Date(event.start).toISOString().split('T')[0]
      });
    }
  }, [event]);

  if (!event) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false); // Edit mode se bahar aayein
  };

  // Event type ke basis par tag ka color decide karein
  const tagColor = event.isUserEvent ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => {
        setIsEditing(false); // Edit mode cancel karein
        onClose();
      }}
      overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 outline-none max-h-[90vh] flex flex-col"
    >
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">{formData.title || formData.event_name}</h2>
        <div>
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">Edit</button>
          ) : (
            <div className="flex space-x-2">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">Save</button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4 overflow-y-auto">
        {isEditing ? (
          <>
            {/* --- Editing View --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" name="accurate_date" value={formData.accurate_date} onChange={handleChange} className="mt-1 w-full form-input"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" name="location" value={formData.location || ''} onChange={handleChange} disabled={event.isUserEvent} className="mt-1 w-full form-input disabled:bg-gray-200"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Summary</label>
              <textarea name="summary" value={formData.summary || ''} onChange={handleChange} disabled={event.isUserEvent} className="mt-1 w-full form-input disabled:bg-gray-200" rows="3"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Hook / Intro Line</label>
              <input type="text" name="hook_intro" value={formData.hook_intro || ''} onChange={handleChange} disabled={event.isUserEvent} className="mt-1 w-full form-input disabled:bg-gray-200"/>
            </div>
             {/* Baaki fields bhi yahan add ki ja sakti hain */}
          </>
        ) : (
          <>
            {/* --- Display View --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <p><strong>🗓️ Date:</strong> {new Date(event.start).toLocaleDateString()}</p>
              <p><strong>📍 Location:</strong> {event.location || 'N/A'}</p>
              <p><strong>🏷️ Type:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${tagColor}`}>{event.isUserEvent ? 'Personal' : (event.type || 'Festival')}</span></p>
              <p><strong>⏰ Time:</strong> {event.time || 'N/A'}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800">Experience Summary:</h4>
              <p className="text-gray-600 whitespace-pre-wrap">{event.summary || 'No summary available.'}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800">Content Potential:</h4>
              <p className="text-gray-600">{event.content_potential || 'N/A'}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800">Hook / Intro Line:</h4>
              <p className="text-gray-600 italic">"{event.hook_intro || 'N/A'}"</p>
            </div>
          </>
        )}
      </div>
      <div className="p-4 bg-gray-50 border-t mt-auto text-right">
         <button onClick={() => { setIsEditing(false); onClose(); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Close</button>
      </div>
    </Modal>
  );
};

export default DashboardDetailModal;