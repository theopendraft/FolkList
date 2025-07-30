// frontend/src/components/UserEventModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const UserEventModal = ({ isOpen, onClose, onSave, event }) => {
  const [title, setTitle] = useState('');
  // The event prop will contain the date for a new event,
  // or the full event object if we are editing.
  const eventDate = event ? new Date(event.date || event.start).toISOString().split('T')[0] : '';

  useEffect(() => {
    // If we are editing an existing event, populate the title
    setTitle(event?.title || '');
  }, [event]);

  const handleSave = () => {
    // Basic validation
    if (!title) {
      alert('Please enter a title.');
      return;
    }
    onSave({
      title: title,
      date: eventDate,
    });
    onClose(); // Close the modal after saving
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 outline-none z-50 text-gray-800"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {event?.title ? 'Edit Event' : 'Add New Event'}
      </h2>
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Event Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Doctor's Appointment"
        />
      </div>
      <div className="mt-4">
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          value={eventDate}
          disabled // Date is set by clicking on the calendar, so we disable editing here
          className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Save Event
        </button>
      </div>
    </Modal>
  );
};

export default UserEventModal;