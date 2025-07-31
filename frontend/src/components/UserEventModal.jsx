import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const UserEventModal = ({ isOpen, onClose, onSave, event }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(''); // New state for the date

  useEffect(() => {
    // If an event is passed, we are editing it.
    if (event) {
      setTitle(event.title || '');
      // Format the date correctly for the input field (YYYY-MM-DD)
      const eventDate = event.date ? new Date(event.date) : new Date();
      setDate(eventDate.toISOString().split('T')[0]);
    } else {
      // If no event, we are creating one. Default to today's date.
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [event, isOpen]); // Rerun when the modal opens or the event changes

  const handleSave = () => {
    if (!title || !date) {
      alert('Please enter a title and select a date.');
      return;
    }
    // Pass the ID if we are editing, otherwise it's a new event
    onSave({ id: event?.id, title, date });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4 outline-none z-50 text-gray-800"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {event?.id ? 'Edit Event' : 'Add New Event'}
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
          value={date}
          // The input is no longer disabled
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500"
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